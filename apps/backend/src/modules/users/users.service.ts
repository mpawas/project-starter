import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { RoleName } from '../../common/enums/role.enum';
import { eq, type SQL } from 'drizzle-orm';
import { DrizzleService } from '../../drizzle/drizzle.service';
import { roles, userRoles, users } from '../../drizzle/schema';

type UserWithRoles = typeof users.$inferSelect & {
  roles: Array<{
    roleId: string;
    role: typeof roles.$inferSelect;
  }>;
};

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly drizzle: DrizzleService) {}

  private async getUserWithRolesBy(
    whereClause: SQL<unknown>,
  ): Promise<UserWithRoles | null> {
    const rows = await this.drizzle.db
      .select({
        user: users,
        userRole: userRoles,
        role: roles,
      })
      .from(users)
      .leftJoin(userRoles, eq(userRoles.userId, users.id))
      .leftJoin(roles, eq(roles.id, userRoles.roleId))
      .where(whereClause);

    if (rows.length === 0) {
      return null;
    }

    const baseUser = rows[0].user;
    const mappedRoles = rows
      .filter(
        (
          row,
        ): row is {
          user: typeof users.$inferSelect;
          userRole: typeof userRoles.$inferSelect;
          role: typeof roles.$inferSelect;
        } => row.userRole !== null && row.role !== null,
      )
      .map((row) => ({
        roleId: row.userRole.roleId,
        role: row.role,
      }));

    return {
      ...baseUser,
      roles: mappedRoles,
    };
  }

  async create(createUserDto: CreateUserDto): Promise<UserWithRoles> {
    const existingUser = await this.getUserWithRolesBy(
      eq(users.email, createUserDto.email),
    );
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const passwordHash = await bcrypt.hash(createUserDto.password, 10);

    await this.drizzle.db
      .insert(roles)
      .values({ name: RoleName.User })
      .onConflictDoNothing();

    const [userRole] = await this.drizzle.db
      .select()
      .from(roles)
      .where(eq(roles.name, RoleName.User))
      .limit(1);
    if (!userRole) {
      throw new NotFoundException('Default role not found');
    }

    const [createdUser] = await this.drizzle.db
      .insert(users)
      .values({
        email: createUserDto.email,
        name: createUserDto.name,
        passwordHash,
      })
      .returning();
    if (!createdUser) {
      throw new NotFoundException('Failed to create user');
    }

    await this.drizzle.db
      .insert(userRoles)
      .values({ userId: createdUser.id, roleId: userRole.id })
      .onConflictDoNothing();

    const user = await this.findById(createdUser.id);

    this.logger.log(`Created user ${user.email}`);
    return user;
  }

  async findByEmail(email: string) {
    return this.getUserWithRolesBy(eq(users.email, email));
  }

  async findById(id: string) {
    const user = await this.getUserWithRolesBy(eq(users.id, id));

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async assignRole(userId: string, roleName: string) {
    const user = await this.findById(userId);

    await this.drizzle.db
      .insert(roles)
      .values({ name: roleName })
      .onConflictDoNothing();

    const [role] = await this.drizzle.db
      .select()
      .from(roles)
      .where(eq(roles.name, roleName))
      .limit(1);
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    await this.drizzle.db
      .insert(userRoles)
      .values({ userId: user.id, roleId: role.id })
      .onConflictDoNothing({
        target: [userRoles.userId, userRoles.roleId],
      });

    return this.findById(user.id);
  }
}

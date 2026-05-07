import { Injectable } from '@nestjs/common';
import { asc } from 'drizzle-orm';
import { DrizzleService } from '../../drizzle/drizzle.service';
import { roles } from '../../drizzle/schema';

@Injectable()
export class RolesService {
  constructor(private readonly drizzle: DrizzleService) {}

  findAll() {
    return this.drizzle.db.select().from(roles).orderBy(asc(roles.name));
  }
}

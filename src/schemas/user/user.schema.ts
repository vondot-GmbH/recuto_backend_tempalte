import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { System, SystemSchema } from '../system.schema';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export class UserProtection {
  private static getDefaultProtection() {
    return {
      firstName: 1,
      lastName: 1,
      email: 1,
    };
  }

  static DEFAULT(): any {
    return {
      ...this.getDefaultProtection(),
    };
  }

  static ADMIN(): any {
    return {
      ...this.getDefaultProtection(),
      system: 1,
    };
  }
}

export class UserPopulate {
  // static DEFAULT() { // TODO das sollt nur als Beispiel dienen
  //   return [
  //     {
  //       path: 'studios',
  //       select: StudioProtection.DEFAULT(),
  //     },
  //   ];
  // }
}

@Schema({
  timestamps: { createdAt: 'system.createdAt', updatedAt: 'system.modifiedAt' },
})
export class User {
  @Prop({ required: false })
  firstName: string;

  @Prop({ required: false })
  lastName?: string;

  @Prop()
  email: string;

  @Prop({ type: SystemSchema })
  system?: System;
}

export const UserSchema = SchemaFactory.createForClass(User);

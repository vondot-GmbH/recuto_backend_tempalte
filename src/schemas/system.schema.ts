import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SystemDocument = System & Document;

@Schema({ _id: false })
export class System {
  @Prop()
  createdAt: Date;

  @Prop()
  modifiedAt: Date;

  @Prop({ default: false, required: false })
  archived?: boolean;

  @Prop({ required: false })
  archivedAt?: Date;
}

export const SystemSchema = SchemaFactory.createForClass(System);

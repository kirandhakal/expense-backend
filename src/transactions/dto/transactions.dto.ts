import { Field, Float, InputType } from '@nestjs/graphql';
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { TransactionType } from '../../database/entities';

@InputType()
export class CreateTransactionInput {
  @Field()
  @IsNotEmpty()
  name: string;

  @Field(() => Float)
  amount: number;

  @Field(() => TransactionType)
  @IsEnum(TransactionType)
  type: TransactionType;

  @Field()
  @IsUUID()
  categoryId: string;

  @Field()
  @IsDateString()
  date: string;

  @Field({ nullable: true })
  @IsOptional()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  memberId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  paymentMethodId?: string;
}

@InputType()
export class UpdateTransactionInput {
  @Field({ nullable: true })
  @IsOptional()
  name?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  amount?: number;

  @Field(() => TransactionType, { nullable: true })
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  date?: string;

  @Field({ nullable: true })
  @IsOptional()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  memberId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  paymentMethodId?: string;
}

@InputType()
export class TransactionFilterInput {
  @Field({ nullable: true })
  @IsOptional()
  type?: TransactionType;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  memberId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

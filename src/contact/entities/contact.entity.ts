import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({
  name: 'contact',
})
export class Contact {
  @PrimaryGeneratedColumn('uuid')
  id: number;
  @Column()
  name: string;
  @Column()
  email: string;
  @Column()
  message: string;
  @Column({ nullable: true })
  subject: string;
  @Column({ nullable: true })
  ip: string;
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { Project } from './Project'

@Entity('ProjectTrack')
export class ProjectTrack {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => Project, {
    eager: true,
    cascade: ['insert'],
  })
  @JoinColumn({ name: 'project_id' })
  project: Project

  @Index()
  @Column()
  project_id: number

  @Column()
  scroll: number

  @Column({ type: 'simple-json' })
  data: string

  @Column()
  @Index()
  name: string

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date
}

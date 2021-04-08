import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn, Index, PrimaryColumn } from "typeorm"

@Entity("Setting")
@Index(["key", "mod"], { unique: true })
export class Setting {
    @PrimaryColumn()
    key: string

    @Column()
    value: string
    
    @Column({nullable: true})
    mod: string

    @Index()
    @Column()
    type: string

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
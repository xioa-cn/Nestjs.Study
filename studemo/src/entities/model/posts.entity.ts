import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";


@Entity('posts')
export class Posts {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string

    @Column({type: 'text', nullable: true})
    content: string | null
}
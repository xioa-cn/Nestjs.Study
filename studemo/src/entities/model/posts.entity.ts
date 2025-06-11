import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";


@Entity('posts')
export class Posts{

    @PrimaryGeneratedColumn()
    id: number;
    
    @Column()
    title: string

    @Column()
    content: string
}
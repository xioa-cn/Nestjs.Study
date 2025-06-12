import {InjectRepository} from "@nestjs/typeorm";
import {Posts} from "../entities/model/posts.entity";
import {Repository} from "typeorm";
import {Injectable} from "@nestjs/common";
import {CreatePostDto} from "../models/createPostDto";
import {RequestResult, ResponseUtil} from "../utils/requestResult";
import {createLinqRepository, ILinqRepository} from "../utils/linq-orm";

@Injectable()
export class PostsService {
    private postsRepository: ILinqRepository<Posts>;

    constructor(
        @InjectRepository(Posts)
        private readonly baseRepository: Repository<Posts>
    ) {
        this.postsRepository = createLinqRepository(baseRepository);
    }

    async findAll(): Promise<RequestResult<Posts[]>> {
        return ResponseUtil.requestResultSuccess(await this.postsRepository.find());
    }

    async findTitle(title: string) {
        return this.postsRepository.linq().withVariable('title', title)
            .where(item => item.title === title)
            .toArray();
    }

    async findInfoByID(id: number) {
        return this.postsRepository.linq().withVariable('id', id)
            .where(item => item.id === id)
            .toArray();
    }

    async findInfoLargeById(id: number) {
        return this.postsRepository.linq()
            .withVariable('id', id)
            .where(item => item.id >= id)
            .toArray();
    }

    async findInfoSmallById(id: number) {
        return this.postsRepository.linq()
            .withVariable('id', id)
            .where(item => item.id < id)
            .toArray();
    }
    
    async findInfo(sid:number,lid:number){
        return this.postsRepository.linq()
            .withVariable('sid',sid)
            .withVariable('lid',lid)
            .where(item => item.id>= sid)
            .andWhere(item=> item.id <= lid)
            .toArray();
    }


    async create(dto: CreatePostDto): Promise<RequestResult<boolean>> {
        const post = new Posts();
        post.title = dto.title;
        post.content = dto.content;
        // 保存到数据库并返回保存后的实体
        try {
            const savedPost = await this.postsRepository.save(post);
            // 检查是否保存成功（例如，检查是否有自增ID）
            if (savedPost.id) {
                return ResponseUtil.requestResultSuccess(true);
            } else {
                throw new Error('保存失败，未生成ID');
            }
        } catch (error) {
            console.error('保存帖子时出错:', error);
            return ResponseUtil.requestResultError(false, error.message, "1000");
        }
    }
}
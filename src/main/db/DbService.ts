import { Connection } from 'typeorm'
import { getDb } from './index'
import { Project } from './entities/Project'
import { ProjectTrack } from './entities/ProjectTrack'
import { Setting } from './entities/Setting'
import { Injectable } from '@nestjs/common'
import { LazyGetter } from 'lazy-get-decorator'

@Injectable()
export default class DBService {
  db?: Connection

  constructor() {}
  async getRepository(Model: any) {
    if (!this.db) {
      this.db = await getDb()
    }
    return this.db.getRepository(Model)
  }

  makeAsyncable(promisedRepo) {
    return new Proxy(
      {},
      {
        get: (target, propKey) => {
          return async (...args) => {
            return (await promisedRepo)[propKey](...args)
          }
        },
      }
    )
  }

  @LazyGetter()
  get projectTracks() {
    return this.makeAsyncable(this.getRepository(ProjectTrack))
  }

  @LazyGetter()
  get projects() {
    return this.makeAsyncable(this.getRepository(Project))
  }

  @LazyGetter()
  get settings() {
    return this.makeAsyncable(this.getRepository(Setting))
  }
}

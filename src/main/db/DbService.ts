import { Connection, EntityTarget, Repository } from 'typeorm'
import { getDb } from './index'
import { Project } from './entities/Project'
import { ProjectTrack } from './entities/ProjectTrack'
import { Setting } from './entities/Setting'
import { Injectable } from '@nestjs/common'
import { LazyGetter } from 'lazy-get-decorator'
import { BESService } from 'core/Service'

@Injectable()
export default class DBService extends BESService {
  db?: Connection

  constructor() {
    super('DBService')
  }

  async getRepository<M extends EntityTarget<any>>(Model: M): Promise<Repository<any>> {
    if (!this.db) {
      this.db = await getDb()
    }
    return this.db.getRepository(Model)
  }

  makeAsyncable<T>(promisedRepo: Promise<T>) {
    return new Proxy(
      {},
      {
        get: (target, propKey) => {
          return async (...args) => {
            return (await promisedRepo)[propKey](...args)
          }
        },
      }
    ) as Awaited<T>
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

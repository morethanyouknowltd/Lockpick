import { Connection } from 'typeorm'
import { getDb } from './index'
import { Project } from './entities/Project'
import { ProjectTrack } from './entities/ProjectTrack'
import { Setting } from './entities/Setting'

export default class DBService {
  db?: Connection

  constructor() {}
  async getRepository(Model: any) {
    if (!this.db) {
      this.db = await getDb()
    }
    return this.db.getRepository(Model)
  }
  get projectTracks() {
    return this.getRepository(ProjectTrack)
  }
  get projects() {
    return this.getRepository(Project)
  }
  get settings() {
    return this.getRepository(Setting)
  }
}

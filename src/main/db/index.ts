import { Connection, createConnection } from 'typeorm'
import { Project } from './entities/Project'
import { ProjectTrack } from './entities/ProjectTrack'
import { Setting } from './entities/Setting'
import { sqlitePath, sqliteBackupPath } from '../config'
import { logger } from '../core/Log'
const fs = require('fs')
const path = require('path')

let conn: Connection
export async function getDb() {
  if (!conn) {
    const newdb = !fs.existsSync(sqlitePath)
    fs.readdir(sqliteBackupPath, (err, files) => {
      if (err) {
        return logger.error(err)
      }
      files.forEach(file => {
        fs.stat(path.join(sqliteBackupPath, file), function (err, stat) {
          if (err) {
            return logger.error(err)
          }
          const expiry =
            new Date(stat.birthtime).getTime() + 1000 * 60 * 60 * (files.length > 20 ? 1 : 7 * 24)
          if (new Date().getTime() > expiry) {
            fs.unlink(path.join(sqliteBackupPath, file), err => {
              if (err) {
                logger.error(err)
              } else {
                logger.info('Deleted old SQLite backup')
              }
            })
          }
        })
      })
    })
    if (!newdb) {
      logger.debug('Backing up current db')
      fs.copyFile(
        sqlitePath,
        path.join(sqliteBackupPath, `db.${new Date().getTime()}.sqlite`),
        err => {
          if (err) logger.error(err)
        }
      )
    }

    logger.debug('Creating connection')
    conn = await createConnection({
      type: 'sqlite',
      database: sqlitePath,
      entities: [Project, ProjectTrack, Setting],
      migrations: [path.join(__dirname, './migrations/*.js')],
    })
    logger.debug('About to run migrations...')
    await conn.runMigrations({
      transaction: 'none',
    })
    logger.debug('Migration ran successfully!')
  }

  return conn
}

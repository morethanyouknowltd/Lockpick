import { logger as mainLogger } from '../../core/Log'
import { getDb } from '../../db'
import { Project } from '../../db/entities/Project'
import { ProjectTrack } from '../../db/entities/ProjectTrack'
const logger = mainLogger.child(`loadData`)

const defaultData = {}

export async function loadDataForTrack(name: string, project: string) {
  const db = await getDb()
  const projectTracks = db.getRepository(ProjectTrack)
  const projects = db.getRepository(Project)
  const existingProject = await projects.findOne({
    where: { name: project },
  })
  if (!existingProject) {
    logger.log(`No project exists for ${project} (track name: ${name}), returning default data`)
    return defaultData
  }
  const saved = await projectTracks.findOne({
    where: {
      project_id: existingProject.id,
      name,
    },
  })
  let data = saved ? saved.data : defaultData
  return data
}

export async function getProjectIdForName(
  project: string,
  create: boolean = false
): Promise<string | null> {
  const db = await getDb()
  const projectTracks = db.getRepository(ProjectTrack)
  const projects = db.getRepository(Project)
  const existingProject = await projects.findOne({
    where: { name: project },
  })
  if (!existingProject && create) {
    const newProjectId = (await projects.save(projects.create({ name: project, data: {} }))).id
    logger.log(`Created new project with id ${newProjectId}`)
    return newProjectId
  } else {
    return existingProject?.id ?? null
  }
}

export async function createOrUpdateTrack(track: string, project: string, data: any) {
  const db = await getDb()
  const projectTracks = db.getRepository(ProjectTrack)
  const projects = db.getRepository(Project)
  const projectId = await getProjectIdForName(project, true)
  const existingTrack = await projectTracks.findOne({
    where: { name: track, project_id: projectId },
  })
  if (existingTrack) {
    logger.info(
      `Updating track (${existingTrack.name} (id: ${existingTrack.id})) with data: `,
      data
    )
    await projectTracks.update(existingTrack.id, {
      data: { ...existingTrack.data, ...data },
    })
  } else {
    const newTrack = projectTracks.create({
      name: track,
      project_id: projectId,
      data,
      scroll: 0, // TODO remove
    })
    await projectTracks.save(newTrack)
  }
}

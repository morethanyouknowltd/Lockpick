import { Injectable } from '@nestjs/common'
import { BESService } from '../core/Service'

/**
 * Releases service responsible for
 * - Checking for new exported files
 * - Keeping trakc of currently open project
 * -
 */
@Injectable()
class ReleasesService extends BESService {
  activate() {}
}

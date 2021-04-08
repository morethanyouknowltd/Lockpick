import { basePath, createFolders } from "../config";
import * as path from 'path'
const fs = require('fs')
const fsPromises = fs.promises
const util = require('util');
const env = process.env as any
import { sortByAsync } from 'lodasync'
import { exists } from "./Files";

if (env.NODE_ENV === 'production') {
    env.ELECTRON_ENABLE_LOGGING = true
}

class ConsoleLogger {
    output(level, ...args) {
        if (level === 'WARN') {
            console.warn(...args)
        } else if (level === 'INFO') {
            console.info(...args)
        } else if (level === 'ERROR') {
            console.error(...args)
        }
    }
    warn(...args) {
        this.output('WARN', ...args)
    }
    info(...args) {
        this.output('INFO', ...args)
    }
    error(...args) {
        this.output('ERROR', ...args)
    }
}

class FileLogger {
    waiting: any[] = []
    fileStream

    constructor(private localPath: string) {}   

    createFilestreamForPath(fullPath) {
        this.fileStream = fs.createWriteStream(fullPath, {
            flags: 'a' // 'a' means appending
        })
        for (const [level, ...args] of this.waiting) {
            this.process(level, ...args) 
        }
    }
    
    async prepare() {
        let logFiles = (await fsPromises.readdir(basePath)).filter(path => {
            return path.indexOf(this.localPath) === 0
        }).map(file => {
            return path.join(basePath, file)
        })
        logFiles = await sortByAsync(async (a, b) => {
            return (await fsPromises.stat(a)).birthtime
        }, logFiles) 
        const bigFiles: string[] = []
        for (const file of logFiles) {
            const size = await this.getFileSizeMB(file)
            if (size > 10) {
                bigFiles.push(file)
            } else {
                this.createFilestreamForPath(file)
            }
        }
        if (!this.fileStream) {
            let i = 0, newFilePath;
            do {
                newFilePath = path.join(basePath, this.localPath) + String(i) + '.log'
                i++
            } while (await exists(newFilePath))
            this.createFilestreamForPath(newFilePath)
        }
        while (bigFiles.length > 5) {
            // start deleting old files until only 5 old ones remain
            await fsPromises.unlink(bigFiles.unshift())
        }
    }

    async getFileSizeMB(path) {
        const stats = await fsPromises.stat(path)
        const fileSizeInBytes = stats.size;
        return fileSizeInBytes / (1024*1024);
    }
    process(level, ...args) {
        const str = `${level}: ` + args.map(arg => {
            if (typeof arg !== 'object') {
                return String(arg)
            } else {
                return util.inspect(arg)
            }
        }).join(' ')
        this.fileStream.write(str + "\n")
    }
    output(level, ...args) {
        if (!this.fileStream) {
            this.waiting.push([level, ...args])
            return
        }
        this.process(level, ...args)
    }
    warn(...args) {
        this.output('WARN', ...args)
    }
    info(...args) {
        this.output('INFO', ...args)
    }
    error(...args) {
        this.output('ERROR', ...args)
    }
}

const getFormattedTime = () => {
    const d = new Date()
    const pad0 = input => ('0' + input).substr(-2)
    return `${d.getHours()}:${pad0(d.getMinutes())}:${pad0(d.getSeconds())}`
}

class CombineLogger extends ConsoleLogger {
    constructor(public loggers: ConsoleLogger[] = []) {
        super()
    }
    output(level, ...args) {
        for (const logger of this.loggers) {
            logger.output(level, getFormattedTime(), ...args)
        }
    }
}

export const logger = new CombineLogger([
    new ConsoleLogger(),
    ...(process.env.NODE_ENV === 'development' ? [] : [new FileLogger(`Lockpick`)])
])

export const fileLogger: FileLogger = logger.loggers[1] as FileLogger
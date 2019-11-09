import { exec } from 'child_process'

interface Option {
    key: string
    value: string
    separator?: string
}

interface OptionConfig {
    separator?: string
}

interface ArgumentConfig {
    wrap?: boolean
}

interface ExecutionResult {
    stdout: string,
    stderr: string
}

export class CommandLine {
    static forCommand(application: string): CommandLine {
        return new CommandLine(application)
    }

    private constructor(
        private application: string,
        private environmentVariables: Option[] = [],
        private flags: string[] = [],
        private options: Option[] = [],
        private commandArguments: string[] = [],
        private separator: string = ' '
    ) {
    }

    public withEnvironmentVariable(key: string, value: string): CommandLine {
        this.environmentVariables.push({
            key,
            value,
        })
        return this
    }

    public withFlag(flag: string): CommandLine {
        this.flags.push(flag)
        return this
    }

    public withOption(key: string, value: string, config: OptionConfig = {}): CommandLine {
        this.options.push({
            key,
            value,
            ...(config.separator ? { separator: config.separator } : {})
        })
        return this
    }

    public withOptionSeparator(separator: string): CommandLine {
        this.separator = separator
        return this
    }

    public withArgument(argument: string, config: ArgumentConfig = { wrap: false }): CommandLine {
        const processedArgument = config.wrap
            ? `"${argument}"`
            : argument

        this.commandArguments.push(processedArgument)
        return this
    }

    public toString(): string {
        const combinedEnvironmentVariables = this.environmentVariables.reduce((acc, next) => {
            return [...acc, `${next.key}=${next.value}`]
        }, []).join(' ')
        const combinedFlags = this.flags.join(' ')
        const combinedOptions = this.options.reduce((acc, next) => {
            const separator = next.separator || this.separator
            return [...acc, `${next.key}${separator}${next.value}`]
        }, []).join(' ')
        const combinedArguments = this.commandArguments.join(' ')

        return [
            combinedEnvironmentVariables,
            this.application,
            combinedFlags,
            combinedOptions,
            combinedArguments
        ]
            .filter(segment => segment.length > 0)
            .join(' ')
    }

    public execute(): Promise<ExecutionResult> {
        return new Promise((resolve, reject) => {
            exec(this.toString(), (error, stdout, stderr) => {
                if (error) {
                    return reject(error)
                }

                return resolve({
                    stdout: stdout.trim(),
                    stderr: stderr.trim()
                })
            })
        })
    }
}

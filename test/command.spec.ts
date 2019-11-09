interface Option {
    key: string
    value: string
    separator?: string
}

interface OptionConfig {
    separator?: string
}

class CommandLine {
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
    ) {}

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

    public withArgument(argument: string): CommandLine {
        this.commandArguments.push(argument)
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
}

describe('CommandLine', () => {
    it('turns a command into a string', () => {
        expect(CommandLine.forCommand('node').toString())
            .toEqual('node')
    })

    it('can assemble complex commands', () => {
        let commandLine =
            CommandLine.forCommand('command-with-options')
                .withEnvironmentVariable('LOCAL', 'true')
                .withFlag('-v')
                .withOption('--opt1', 'val1')
                .withArgument('path/to/file.txt')

        expect(commandLine.toString())
            .toEqual('LOCAL=true command-with-options -v --opt1 val1 path/to/file.txt')
    })

    describe('withOption', () => {
        it('includes options after the command separated by a space', () => {
            let commandLine =
                CommandLine.forCommand('command-with-options')
                    .withOption('--opt1', 'val1')
                    .withOption('--opt2', 'val2')

            expect(commandLine.toString())
                .toEqual('command-with-options --opt1 val1 --opt2 val2')
        })

        it('includes options with a custom separator', () => {
            let commandLine =
                CommandLine.forCommand('command-with-options')
                    .withOptionSeparator('=')
                    .withOption('--opt1', 'val1')
                    .withOption('--opt2', 'val2')

            expect(commandLine.toString())
                .toEqual('command-with-options --opt1=val1 --opt2=val2')
        })

        it('includes options with mixed separators', () => {
            let commandLine =
                CommandLine.forCommand('command-with-options')
                    .withOption('--opt1', 'val1', { separator: '=' })
                    .withOption('--opt2', 'val2')

            expect(commandLine.toString())
                .toEqual('command-with-options --opt1=val1 --opt2 val2')
        })

        it('includes options with a custom separator and mixed separators', () => {
            let commandLine =
                CommandLine.forCommand('command-with-options')
                    .withOptionSeparator('=')
                    .withOption('--opt1', 'val1', { separator: ' ' })
                    .withOption('--opt2', 'val2')

            expect(commandLine.toString())
                .toEqual('command-with-options --opt1 val1 --opt2=val2')
        })
    })

    describe('withFlag', () => {
        it('includes flags after the command', () => {
            let commandLine =
                CommandLine.forCommand('command-with-options')
                    .withFlag('--verbose')
                    .withFlag('-h')

            expect(commandLine.toString())
                .toEqual('command-with-options --verbose -h')
        })
    })

    describe('withArgument', () => {
        it('includes arguments after the command', () => {
            let commandLine =
                CommandLine.forCommand('command-with-options')
                    .withArgument('path/to/file.txt')

            expect(commandLine.toString())
                .toEqual('command-with-options path/to/file.txt')
        })
    })

    describe('withEnvironmentVariable', () => {
        it('includes environment variables before the command', () => {
            let commandLine =
                CommandLine.forCommand('command-with-options')
                    .withEnvironmentVariable('ENV_VAR1', 'VAL1')
                    .withEnvironmentVariable('ENV_VAR2', 'VAL2')

            expect(commandLine.toString())
                .toEqual('ENV_VAR1=VAL1 ENV_VAR2=VAL2 command-with-options')
        })
    })
})

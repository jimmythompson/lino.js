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
        private options: Option[] = [],
        private separator: string = ' '
    ) {}

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

    public toString(): string {
        const combinedOptions = this.options.reduce((acc, next) => {
                const separator = next.separator || this.separator
                return [...acc, `${next.key}${separator}${next.value}`]
            },
            []
        ).join(' ')

        return [
            this.application,
            combinedOptions
        ]
            .filter(segment => segment.length > 0)
            .join(' ')
    }
}

describe('CommandLine', () => {
    describe('toString', () => {
        test('turns a command into a string', () => {
            expect(CommandLine.forCommand('node').toString())
                .toEqual('node')
        })

        test('includes options after the command separated by a space', () => {
            let commandLine =
                CommandLine.forCommand('command-with-options')
                    .withOption('--opt1', 'val1')
                    .withOption('--opt2', 'val2')

            expect(commandLine.toString())
                .toEqual('command-with-options --opt1 val1 --opt2 val2')
        })

        test('includes options with a custom separator', () => {
            let commandLine =
                CommandLine.forCommand('command-with-options')
                    .withOptionSeparator('=')
                    .withOption('--opt1', 'val1')
                    .withOption('--opt2', 'val2')

            expect(commandLine.toString())
                .toEqual('command-with-options --opt1=val1 --opt2=val2')
        })

        test('includes options with mixed separators', () => {
            let commandLine =
                CommandLine.forCommand('command-with-options')
                    .withOption('--opt1', 'val1', { separator: '=' })
                    .withOption('--opt2', 'val2')

            expect(commandLine.toString())
                .toEqual('command-with-options --opt1=val1 --opt2 val2')
        })

        test('includes options with a custom separator and mixed separators', () => {
            let commandLine =
                CommandLine.forCommand('command-with-options')
                    .withOptionSeparator('=')
                    .withOption('--opt1', 'val1', { separator: ' ' })
                    .withOption('--opt2', 'val2')

            expect(commandLine.toString())
                .toEqual('command-with-options --opt1 val1 --opt2=val2')
        })
    })
})

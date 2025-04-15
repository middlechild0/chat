import { useState, useEffect, useCallback } from 'react';

export interface Command {
  command: string;
  description: string;
  action: (args: string[]) => Promise<string>;
}

export function useTerminalCommands(initialCommands: Command[] = []) {
  const [commands, setCommands] = useState<Command[]>(initialCommands);
  const [history, setHistory] = useState<string[]>([]);
  const [output, setOutput] = useState<string>('');

  const runCommand = useCallback(
    async (input: string) => {
      setHistory((prev) => [...prev, input]);
      const [cmd, ...args] = input.trim().split(/\s+/);
      const command = commands.find((c) => c.command === cmd);
      if (!command) {
        const errMsg = `Command not found: ${cmd}`;
        setOutput(errMsg);
        return errMsg;
      }
      try {
        const result = await command.action(args);
        setOutput(result);
        return result;
      } catch (error) {
        const errMsg = `Error executing command: ${error}`;
        setOutput(errMsg);
        return errMsg;
      }
    },
    [commands]
  );

  const addCommand = useCallback((command: Command) => {
    setCommands((prev) => [...prev, command]);
  }, []);

  const handleSpecialCommand = useCallback((command: string) => {
    setHistory((prev) => [...prev, `> ${command}`]);
    switch (command.toLowerCase()) {
      case 'prepare':
        setHistory((prev) => [...prev, '>> system primed for data extraction']);
        break;
      case 'question':
        setHistory((prev) => [...prev, '>> secure line open for inquiries']);
        break;
      case 'join':
        setHistory((prev) => [...prev, '>> initiating recruitment protocol']);
        break;
      case 'wake up':
        setHistory((prev) => [...prev, ">> Hello, friend. You've been sleeping too long."]);
        break;
      default:
        setHistory((prev) => [...prev, '>> command not recognized']);
    }
  }, []);

  return {
    commands,
    history,
    output,
    runCommand,
    addCommand,
    handleSpecialCommand,
  };
}
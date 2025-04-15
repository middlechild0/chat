export interface Command {
  command: string;
  description?: string;
  action: (args?: string[]) => Promise<string> | string;
}

export interface TerminalState {
  history: string[];
  output: string;
}

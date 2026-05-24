export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export interface StreamTextArgs {
    system: string;
    messages: ChatMessage[];
    model: string;
    maxTokens: number;
    signal?: AbortSignal;
}

export interface StreamUsage {
    input_tokens: number | null;
    output_tokens: number | null;
}

export interface StreamFinalize {
    usage: StreamUsage;
    model: string;
}

export interface StreamTextResult {
    textIterator: AsyncIterable<string>;
    finalize: () => Promise<StreamFinalize | null>;
}

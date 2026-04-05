
import { MemoryEntry } from '../types';
import { storageService } from './storageService';
import { generateEmbedding } from './geminiService';

/**
 * Neural Memory Persistence Layer
 * Implements a simple vector-based memory system for agents.
 */
class MemoryService {
  private memories: MemoryEntry[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private async loadFromStorage() {
    try {
      const dbMemories = await storageService.loadAll('memories');
      if (dbMemories.length > 0) {
        this.memories = dbMemories;
      } else {
        const saved = localStorage.getItem('synapse_agent_memories_v1');
        if (saved) {
          this.memories = JSON.parse(saved);
          // Migrate to IndexedDB
          await storageService.save('memories', this.memories);
        }
      }
    } catch (e) {
      console.error("Failed to load memories:", e);
      this.memories = [];
    }
  }

  private async saveToStorage() {
    try {
      // IndexedDB handles much larger datasets than localStorage
      await storageService.save('memories', this.memories);
    } catch (e) {
      console.error("Memory Persistence Failure:", e);
    }
  }

  /**
   * Cosine similarity for embeddings
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    let dotProduct = 0;
    let mA = 0;
    let mB = 0;
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      mA += a[i] * a[i];
      mB += b[i] * b[i];
    }
    const mag = Math.sqrt(mA) * Math.sqrt(mB);
    if (mag === 0) return 0;
    return dotProduct / mag;
  }

  async saveMemory(agentId: string, content: string, metadata?: any): Promise<MemoryEntry> {
    // Generate real embedding using Gemini
    const embedding = await generateEmbedding(content);
    
    const entry: MemoryEntry = {
      id: `mem_${Math.random().toString(36).substr(2, 9)}`,
      agentId,
      content,
      embedding,
      timestamp: new Date().toISOString(),
      metadata
    };

    this.memories.push(entry);
    this.saveToStorage();
    return entry;
  }

  async getAgentMemories(agentId: string, query?: string, limit: number = 10): Promise<(MemoryEntry & { score?: number })[]> {
    let results = this.memories.filter(m => m.agentId === agentId);

    if (query) {
      // Real semantic search using Gemini embeddings
      const queryEmbedding = await generateEmbedding(query);
      const resultsWithScores = results.map(m => ({
        ...m,
        score: this.cosineSimilarity(m.embedding, queryEmbedding)
      }));

      // Sort by score descending
      resultsWithScores.sort((a, b) => (b.score || 0) - (a.score || 0));
      return resultsWithScores.slice(0, limit);
    } else {
      results = results.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      return results.slice(0, limit);
    }
  }

  async clearMemories(agentId?: string) {
    if (agentId) {
      this.memories = this.memories.filter(m => m.agentId !== agentId);
    } else {
      this.memories = [];
    }
    this.saveToStorage();
  }
}

export const memoryService = new MemoryService();
export const saveMemory = (agentId: string, content: string, metadata?: any) => memoryService.saveMemory(agentId, content, metadata);
export const getAgentMemories = (agentId: string, query?: string, limit?: number) => memoryService.getAgentMemories(agentId, query, limit);
export const clearMemories = (agentId?: string) => memoryService.clearMemories(agentId);
export const retrieveMemoriesSemantically = (agentId: string, query: string, limit?: number) => memoryService.getAgentMemories(agentId, query, limit);

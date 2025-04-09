export default class NameManager {
  private static instance: NameManager;
  usedNames: string[] = [];
  public static getInstance(): NameManager {
    if (!NameManager.instance) {
      NameManager.instance = new NameManager();
    }

    return NameManager.instance;
  }
  constructor() {}
}

export type { NameManager };

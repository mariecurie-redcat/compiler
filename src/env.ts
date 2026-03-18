class Environment {
  private values: Record<string, unknown> = {}
  private enclosing: Environment | null

  constructor(enclosing: Environment | null = null) {
    this.enclosing = enclosing
  }

  define(name: string, value: unknown): void {
    this.values[name] = value
  }

  get(name: string): unknown {
    if (name in this.values) {
      return this.values[name]
    }
    if (this.enclosing !== null) {
      return this.enclosing.get(name)
    }
    throw new Error(`Undefined variable '${name}'.`)
  }

  assign(name: string, value: unknown): void {
    if (name in this.values) {
      this.values[name] = value
      return
    }
    if (this.enclosing !== null) {
      this.enclosing.assign(name, value)
      return
    }else{
        this.define(name, value)
        return
    }
    throw new Error(`Undefined variable '${name}'.`)
  }
}

export { Environment }

import { Token, TokenType } from './token.js'

const keywords: Record<string, TokenType> = {
  'and': TokenType.AND,
  'class': TokenType.CLASS,
  'else': TokenType.ELSE,
  'false': TokenType.FALSE,
  'for': TokenType.FOR,
  'fun': TokenType.FUN,
  'if': TokenType.IF,
  'nil': TokenType.NIL,
  'or': TokenType.OR,
  'print': TokenType.PRINT,
  'return': TokenType.RETURN,
  'super': TokenType.SUPER,
  'this': TokenType.THIS,
  'true': TokenType.TRUE,
  'var': TokenType.VAR,
  'while': TokenType.WHILE
}

class Scanner {
  source: string
  tokens: Token[]
  start: number = 0
  current: number = 0
  line: number = 1

  constructor(source: string) {
    this.source = source
    this.tokens = []
  }

  scanTokens(): Token[] {
    while (!this.isAtEnd()) {
      this.start = this.current
      this.scanToken()
    }

    this.tokens.push(new Token(TokenType.EOF, '', null, this.line))
    return this.tokens
  }

  isAtEnd(): boolean {
    return this.current >= this.source.length
  }

  scanToken(): void {
    const c = this.advance()
    if (c === '*') {
      this.addToken(TokenType.STAR)
    } else if (c === '!') {
      this.addToken(this.match('=') ? TokenType.BANG_EQUAL : TokenType.BANG)
    } else if (c === '=') {
      this.addToken(this.match('=') ? TokenType.EQUAL_EQUAL : TokenType.EQUAL)
    } else if (c === '<') {
      this.addToken(this.match('=') ? TokenType.LESS_EQUAL : TokenType.LESS)
    } else if (c === '>') {
      this.addToken(this.match('=') ? TokenType.GREATER_EQUAL : TokenType.GREATER)
    } else if (c === '(') {
      this.addToken(TokenType.LEFT_PAREN)
    } else if (c === ')') {
      this.addToken(TokenType.RIGHT_PAREN)
    } else if (c === '{') {
      this.addToken(TokenType.LEFT_BRACE)
    } else if (c === '}') {
      this.addToken(TokenType.RIGHT_BRACE)
    } else if (c === ',') {
      this.addToken(TokenType.COMMA)
    } else if (c === '.') {
      this.addToken(TokenType.DOT)
    } else if (c === '-') {
      this.addToken(TokenType.MINUS)
    } else if (c === '+') {
      this.addToken(TokenType.PLUS)
    } else if (c === ';') {
      this.addToken(TokenType.SEMICOLON)
    } else if (c === '/') {
      if (this.match('/')) {
        while (this.current < this.source.length && this.source[this.current] !== '\n') {
          this.advance()
        }
      } else {
        this.addToken(TokenType.SLASH)
      }
    } else if (c === ' ' || c === '\r' || c === '\t') {
      // ignore whitespace
    } else if (c === '\n') {
      this.line += 1
    } else if (c === '"') {
      this.string()
    } else {
      if (this.isDigit(c)) {
        this.number()
      } else if (this.isAlpha(c)) {
        this.identifier()
      } else {
        console.log(`line ${this.line} Unexpected character: ${c} ${this.isAlpha(c)}`)
      }
    }
  }

  identifier(): void {
    while (this.isAlphaNumeric(this.peek())) {
      this.advance()
    }
    const literal = this.source.slice(this.start, this.current)
    const tokenType = keywords[literal] ?? TokenType.IDENTIFIER
    this.addToken(tokenType, literal)
  }

  number(): void {
    while (this.isDigit(this.peek())) {
      this.advance()
    }
    if (this.peek() === '.' && this.isDigit(this.peekNext())) {
      this.advance()
      while (this.isDigit(this.peek())) {
        this.advance()
      }
    }
    const literal = this.source.slice(this.start, this.current)
    this.addToken(TokenType.NUMBER, literal)
  }

  peekNext(): string {
    if (this.current + 1 >= this.source.length) {
      return '\0'
    }
    return this.source[this.current + 1]!
  }

  isDigit(c: string): boolean {
    return c >= '0' && c <= '9'
  }

  isAlpha(c: string): boolean {
    return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_'
  }

  isAlphaNumeric(c: string): boolean {
    return this.isAlpha(c) || this.isDigit(c)
  }

  string(): void {
    while (this.peek() !== '"' && !this.isAtEnd()) {
      if (this.peek() === '\n') {
        this.line += 1
      }
      this.advance()
    }
    if (this.isAtEnd()) {
      console.log(`line ${this.line} Unterminated string.`)
      return
    }
    this.advance()
    const literal = this.source.slice(this.start + 1, this.current - 1)
    this.addToken(TokenType.STRING, literal)
  }

  advance(): string {
    this.current += 1
    return this.source[this.current - 1]!
  }

  addToken(tokenType: TokenType, literal?: unknown): void {
    const text = this.source.slice(this.start, this.current)
    this.tokens.push(new Token(tokenType, text, literal ?? null, this.line))
  }

  match(expected: string): boolean {
    if (this.isAtEnd()) {
      return false
    }
    if (this.source[this.current] === expected) {
      this.current += 1
      return true
    }
    return false
  }

  peek(): string {
    if (this.isAtEnd()) {
      return '\0'
    }
    return this.source[this.current]!
  }
}

export { Scanner }

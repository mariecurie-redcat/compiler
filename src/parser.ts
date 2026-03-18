import { Assignment, Binary, Expr, Grouping, Literal, Unary, Variable } from './expr.js'
import { ExpressionStmt, PrintStmt, Stmt, VarStmt } from './stmt.js'
import { Token, TokenType } from './token.js'

// 语法规则：
// expression     → equality ;
// equality       → comparison ( ( "!=" | "==" ) comparison )* ;
// comparison     → term ( ( ">" | ">=" | "<" | "<=" ) term )* ;
// term           → factor ( ( "-" | "+" ) factor )* ;
// factor         → unary ( ( "/" | "*" ) unary )* ;
// unary          → ( "!" | "-" ) unary
//                | primary ;
// primary        → NUMBER | STRING | "true" | "false" | "nil"
//                | "(" expression ")" ;

class Parser {
  tokens: Token[]
  current: number

  constructor(tokens: Token[]) {
    this.tokens = tokens
    this.current = 0
  }

  parse(): Stmt[] {
    const statements: Stmt[] = []
    while (!this.isAtEnd()) {
      statements.push(this.declaration())
    }
    return statements
  }

  private declaration(): Stmt {
    if (this.match(TokenType.VAR)) {
      return this.varDeclaration()
    }
    return this.statement()
  }

  private varDeclaration(): VarStmt {
    const name = this.consume(TokenType.IDENTIFIER, "Expect variable name.")
    let initializer: Expr | null = null
    if (this.match(TokenType.EQUAL)) {
      initializer = this.assignment()
    }
    this.consume(TokenType.SEMICOLON, "Expect ';' after variable declaration.")
    return new VarStmt(name, initializer)
  }

  private statement(): ExpressionStmt | PrintStmt {
    if (this.match(TokenType.PRINT)) {
      return this.printStatement()
    }
    return this.expressionStatement()
  }

  private printStatement(): PrintStmt {
    const value = this.equality()
    this.consume(TokenType.SEMICOLON, "Expect ';' after value.")
    return new PrintStmt(value)
  }

  private expressionStatement(): ExpressionStmt {
    const expr = this.assignment()
    this.consume(TokenType.SEMICOLON, "Expect ';' after value.")
    return new ExpressionStmt(expr)
  }

  private assignment() :Expr {
    let expr = this.equality()
    if (this.match(TokenType.EQUAL)) {
      const token = this.previous()
      const value = this.assignment()
      if (expr instanceof Variable) {
        const name = expr.name
        return new Assignment(name, value)
      }
      this.error(token, "Invalid assignment target")
    }
    return expr
  }

  private equality() {
    let expr = this.comparison()
    while (this.match(TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL)) {
      const operator = this.previous()
      const right = this.comparison()
      expr = new Binary(expr, operator, right)
    }
    return expr
  }

  private comparison() {
    let expr = this.term()
    while (this.match(TokenType.GREATER, TokenType.GREATER_EQUAL, TokenType.LESS, TokenType.LESS_EQUAL)) {
      const operator = this.previous()
      const right = this.term()
      expr = new Binary(expr, operator, right)
    }
    return expr
  }

  private term() {
    let expr = this.factor()
    while (this.match(TokenType.MINUS, TokenType.PLUS)) {
      const operator = this.previous()
      const right = this.factor()
      expr = new Binary(expr, operator, right)
    }
    return expr
  }

  private factor() {
    let expr = this.unary()
    while (this.match(TokenType.SLASH, TokenType.STAR)) {
      const operator = this.previous()
      const right = this.unary()
      expr = new Binary(expr, operator, right)
    }
    return expr
  }

  private unary() :Expr{
    if (this.match(TokenType.BANG, TokenType.MINUS)) {
      const operator = this.previous()
      const right = this.unary()
      return new Unary(operator, right)
    }
    return this.primary()
  }

  private primary():Expr {
    if (this.match(TokenType.FALSE, TokenType.TRUE, TokenType.NIL)) {
      return new Literal(this.previous().literal)
    }
    if (this.match(TokenType.NUMBER, TokenType.STRING)) {
      return new Literal(this.previous().literal)
    }
    if (this.match(TokenType.IDENTIFIER)) {
      return new Variable(this.previous())
    }
    if (this.match(TokenType.LEFT_PAREN)) {
      const expr = this.equality()
      this.consume(TokenType.RIGHT_PAREN, "Expect ')' after expression.")
      return new Grouping(expr)
    }
    throw this.error(this.peek(), "Expect expression.")
  }

  private error(token: Token, message: string): never {
    console.log(`[line ${token.line}] Error: ${message}`)
    throw new Error(message)
  }

  private consume(tokenType: TokenType, message: string): Token {
    if (this.check(tokenType)) {
      return this.advance()
    }
    throw this.error(this.peek(), message)
  }

  private match(...tokenTypes: TokenType[]): boolean {
    for (const tokenType of tokenTypes) {
      if (this.check(tokenType)) {
        this.advance()
        return true
      }
    }
    return false
  }

  private check(tokenType: TokenType): boolean {
    if (this.isAtEnd()) {
      return false
    }
    return this.peek().type === tokenType
  }

  private advance(): Token {
    if (!this.isAtEnd()) {
      this.current += 1
    }
    return this.previous()
  }

  private isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF
  }

  private peek(): Token {
    return this.tokens[this.current]!
  }

  private previous(): Token {
    return this.tokens[this.current - 1]!
  }

  private synchronize(): void {
    this.advance()
    while (!this.isAtEnd()) {
      if (this.previous().type === TokenType.SEMICOLON) {
        return
      }
      const type = this.peek().type
      if (type === TokenType.CLASS || type === TokenType.FUN || type === TokenType.VAR ||
          type === TokenType.FOR || type === TokenType.IF ||
          type === TokenType.WHILE || type === TokenType.PRINT || type === TokenType.RETURN) {
        return
      }
      this.advance()
    }
  }
}

export { Parser }

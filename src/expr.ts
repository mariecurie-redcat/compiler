import { Token } from './token.js'

// 访问者接口
interface ExprVisitor<T> {
  visitBinaryExpr(expr: Binary): T
  visitGroupingExpr(expr: Grouping): T
  visitLiteralExpr(expr: Literal): T
  visitUnaryExpr(expr: Unary): T
  visitVariableExpr(expr: Variable): T
  visitAssignmentExpr(expr: Assignment): T
}

// 基类 Expr
abstract class Expr {
  abstract accept<T>(visitor: ExprVisitor<T>): T
  abstract toString(): string
}

// 二元表达式
class Binary extends Expr {
  left: Expr
  operator: Token
  right: Expr

  constructor(left: Expr, operator: Token, right: Expr) {
    super()
    this.left = left
    this.operator = operator
    this.right = right
  }

  accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitBinaryExpr(this)
  }

  toString(): string {
    return `(${this.operator.lexeme} ${this.left} ${this.right})`
  }
}

// 分组表达式
class Grouping extends Expr {
  expression: Expr

  constructor(expression: Expr) {
    super()
    this.expression = expression
  }

  accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitGroupingExpr(this)
  }

  toString(): string {
    return `(${this.expression})`
  }
}

// 字面量表达式
class Literal extends Expr {
  value: unknown

  constructor(value: unknown) {
    super()
    this.value = value
  }

  accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitLiteralExpr(this)
  }

  toString(): string {
    return String(this.value)
  }
}

// 一元表达式
class Unary extends Expr {
  operator: Token
  right: Expr

  constructor(operator: Token, right: Expr) {
    super()
    this.operator = operator
    this.right = right
  }

  accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitUnaryExpr(this)
  }

  toString(): string {
    return `(${this.operator.lexeme} ${this.right})`
  }
}

// 变量表达式
class Variable extends Expr {
  name: Token

  constructor(name: Token) {
    super()
    this.name = name
  }

  accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitVariableExpr(this)
  }

  toString(): string {
    return this.name.lexeme
  }
}

// 赋值表达式
class Assignment extends Expr {
  name: Token
  value: Expr

  constructor(name: Token, value: Expr) {
    super()
    this.name = name
    this.value = value
  }

  accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitAssignmentExpr(this)
  }

  toString(): string {
    return `${this.name.lexeme} ${this.value}`
  }
}

export { Expr, Binary, Grouping, Literal, Unary, Variable, Assignment }
export type { ExprVisitor }
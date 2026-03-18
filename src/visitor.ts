import { Environment } from './env.js'
import { Assignment, Binary, Grouping, Literal, Unary, Variable, Expr } from './expr.js'
import type { ExprVisitor } from './expr.js'
import  { ExpressionStmt, PrintStmt, VarStmt, Stmt } from './stmt.js'
import type { StmtVisitor } from './stmt.js'
import { Token, TokenType } from './token.js'

// AST 打印器
class AstPrinter implements ExprVisitor<string> {
  visitBinaryExpr(expr: Binary): string {
    return this.parenthesize(expr.operator.lexeme, expr.left, expr.right)
  }

  visitGroupingExpr(expr: Grouping): string {
    return this.parenthesize('group', expr.expression)
  }

  visitLiteralExpr(expr: Literal): string {
    if (expr.value === null) {
      return 'nil'
    }
    return String(expr.value)
  }

  visitUnaryExpr(expr: Unary): string {
    return this.parenthesize(expr.operator.lexeme, expr.right)
  }

  visitVariableExpr(expr: Variable): string {
    return expr.name.lexeme
  }

  visitAssignmentExpr(expr: Assignment): string {
    return this.parenthesize(expr.name.lexeme, expr.value)
  }

  private parenthesize(name: string, ...exprs: Expr[]): string {
    let result = `(${name}`
    for (const expr of exprs) {
      result += ` ${expr.accept(this)}`
    }
    result += ')'
    return result
  }

  print(expr: Expr): void {
    console.log(expr.accept(this))
  }
}

// 解释器
class Interpreter implements ExprVisitor<unknown>, StmtVisitor<void> {
  env: Environment

  constructor() {
    this.env = new Environment()
  }

  visitBinaryExpr(expr: Binary): unknown {
    // 算术运算符
    if (
      expr.operator.type === TokenType.MINUS ||
      expr.operator.type === TokenType.PLUS ||
      expr.operator.type === TokenType.SLASH ||
      expr.operator.type === TokenType.STAR
    ) {
      console.log(`--------expr.operator ${expr.right === null}`)
      console.log(`--------${expr.toString()}`)
      const left = Number(this.visit(expr.left))
      const right = Number(this.visit(expr.right))
      this.checkNumberOperand(expr.operator, left, right)
      if (expr.operator.type === TokenType.MINUS) {
        return left - right
      }
      if (expr.operator.type === TokenType.PLUS) {
        return left + right
      }
      if (expr.operator.type === TokenType.SLASH) {
        return left / right
      }
      if (expr.operator.type === TokenType.STAR) {
        return left * right
      }
    }
    // 比较运算符
    if (
      expr.operator.type === TokenType.GREATER ||
      expr.operator.type === TokenType.GREATER_EQUAL ||
      expr.operator.type === TokenType.LESS ||
      expr.operator.type === TokenType.LESS_EQUAL
    ) {
      const left = Number(this.visit(expr.left))
      const right = Number(this.visit(expr.right))
      this.checkNumberOperand(expr.operator, left, right)
      if (expr.operator.type === TokenType.GREATER) {
        return left > right
      }
      if (expr.operator.type === TokenType.GREATER_EQUAL) {
        return left >= right
      }
      if (expr.operator.type === TokenType.LESS) {
        return left < right
      }
      if (expr.operator.type === TokenType.LESS_EQUAL) {
        return left <= right
      }
    }
    // 相等运算符
    if (
      expr.operator.type === TokenType.EQUAL_EQUAL ||
      expr.operator.type === TokenType.BANG_EQUAL
    ) {
      const left = Number(this.visit(expr.left))
      const right = Number(this.visit(expr.right))
      if (expr.operator.type === TokenType.EQUAL_EQUAL) {
        return left === right
      }
      if (expr.operator.type === TokenType.BANG_EQUAL) {
        return left !== right
      }
    }
    throw new Error('Unknown operator')
  }

  visitLiteralExpr(expr: Literal): unknown {
    console.log(`--------expr.value: ${expr.value}`)
    return expr.value
  }

  visitUnaryExpr(expr: Unary): unknown {
    if (expr.operator.type === TokenType.MINUS) {
      console.log(`--------expr.right.value: ${expr.right === null}`)
      const right = this.visit(expr.right)
      this.checkNumberOperand(expr.operator, right)
      return -Number(right)
    }
    if (expr.operator.type === TokenType.BANG) {
      return !this.visit(expr.right)
    }
    throw new Error('Unknown unary operator')
  }

  visitGroupingExpr(expr: Grouping): unknown {
    return this.visit(expr.expression)
  }

  visitVariableExpr(expr: Variable): unknown {
    console.log(`--------expr.name.lexeme: ${expr.name.lexeme}` + this.env.get(expr.name.lexeme))
    return this.env.get(expr.name.lexeme)
  }

  visitAssignmentExpr(expr: Assignment): unknown {
    const value = this.visit(expr.value)
    this.env.assign(expr.name.lexeme, value)
       console.log(`--- assignment-----expr.name.lexeme: ${expr.name.lexeme} ` + value)
    return value
  }

  visitExpressionStmt(stmt: ExpressionStmt): void {
    const value = this.visit(stmt.expression)
    // console.log(value)
  }

  visitPrintStmt(stmt: PrintStmt): void {
    const value = this.visit(stmt.expression)
    console.log(value)
  }

  visitVarStmt(stmt: VarStmt): void {
    let value: unknown = null
    if (stmt.initializer !== null) {
      value = this.visit(stmt.initializer)
    }
    this.env.assign(stmt.name.lexeme, value)
  }

  interpret(statements: Stmt[]): void {
    for (const statement of statements) {
      this.execute(statement)
    }
  }

  execute(stmt: Stmt): unknown {
    return stmt.accept(this)
  }

  visit(expr: Expr): unknown {
    return expr.accept(this)
  }

  private checkNumberOperand(operator: Token, operand: unknown, right?: unknown): void {
    if (
      typeof operand === 'number' &&
      (typeof right === 'number' || right === undefined)
    ) {
      return
    }
    throw new Error('Operand must be a number.')
  }
}

export { AstPrinter, Interpreter }

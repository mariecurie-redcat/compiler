import type { Expr } from './expr.js'
import { Token } from './token.js'

// 基类 Stmt
abstract class Stmt {
  abstract accept<T>(visitor: StmtVisitor<T>): T
}

// 表达式语句
class ExpressionStmt extends Stmt {
  expression: Expr

  constructor(expression: Expr) {
    super()
    this.expression = expression
  }

  accept<T>(visitor: StmtVisitor<T>): T {
    return visitor.visitExpressionStmt(this)
  }
}

// 打印语句
class PrintStmt extends Stmt {
  expression: Expr

  constructor(expression: Expr) {
    super()
    this.expression = expression
  }

  accept<T>(visitor: StmtVisitor<T>): T {
    return visitor.visitPrintStmt(this)
  }
}

// 变量声明语句
class VarStmt extends Stmt {
  name: Token
  initializer: Expr | null

  constructor(name: Token, initializer: Expr | null) {
    super()
    this.name = name
    this.initializer = initializer
  }

  accept<T>(visitor: StmtVisitor<T>): T {
    return visitor.visitVarStmt(this)
  }
}

// 访问者接口
interface StmtVisitor<T> {
  visitExpressionStmt(stmt: ExpressionStmt): T
  visitPrintStmt(stmt: PrintStmt): T
  visitVarStmt(stmt: VarStmt): T
}

export { Stmt, ExpressionStmt, PrintStmt, VarStmt }
export type { StmtVisitor }

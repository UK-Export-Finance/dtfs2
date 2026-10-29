module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce JSDoc documentation on all regex constants',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      missingRegexDoc: 'All regex constants must have JSDoc documentation.',
    },
    schema: [],
  },
  create(context) {
    const sourceCode = context.sourceCode;

    /**
     * Check if a node is a regex pattern assignment
     */
    function isRegexAssignment(initNode) {
      if (!initNode) return false;

      // Direct regex literal: /pattern/
      if (initNode.type === 'Literal' && initNode.regex) {
        return true;
      }

      // RegExp constructor: new RegExp(...)
      if (
        initNode.type === 'NewExpression' &&
        initNode.callee.type === 'Identifier' &&
        initNode.callee.name === 'RegExp'
      ) {
        return true;
      }

      // Arrow function returning RegExp: () => new RegExp(...)
      if (
        initNode.type === 'ArrowFunctionExpression' &&
        initNode.body &&
        ((initNode.body.type === 'NewExpression' &&
          initNode.body.callee.type === 'Identifier' &&
          initNode.body.callee.name === 'RegExp') ||
          (initNode.body.type === 'Literal' && initNode.body.regex))
      ) {
        return true;
      }

      return false;
    }

    /**
     * Get the declaration node for comment retrieval
     */
    function getCommentParent(varNode) {
      const varDeclaration = varNode.parent;
      if (!varDeclaration || varDeclaration.type !== 'VariableDeclaration') {
        return null;
      }

      const exportNode = varDeclaration.parent;

      return exportNode?.type === 'ExportNamedDeclaration' ||
        exportNode?.type === 'ExportDefaultDeclaration'
        ? exportNode
        : varDeclaration;
    }

    /**
     * Check if node has JSDoc comment
     */
    function hasJsDoc(commentParent) {
      if (!commentParent) return false;

      const comments = sourceCode.getCommentsBefore(commentParent);
      return comments.some(
        (comment) =>
          comment.type === 'Block' && comment.value.startsWith('*'),
      );
    }

    return {
      VariableDeclarator(node) {
        // Check if this is a regex assignment
        if (!isRegexAssignment(node.init)) {
          return;
        }

        // Get the parent node for comment checking
        const commentParent = getCommentParent(node);

        // Report if no JSDoc found
        if (!hasJsDoc(commentParent)) {
          context.report({
            node,
            messageId: 'missingRegexDoc',
          });
        }
      },
    };
  },
};

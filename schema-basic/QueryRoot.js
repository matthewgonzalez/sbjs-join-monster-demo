import {
  GraphQLObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
  GraphQLInt
} from 'graphql'


import joinMonster from 'join-monster'
import knex from './database'
import dbCall from '../data/fetch'
import User from './User'

export default new GraphQLObjectType({
  description: 'global query object',
  name: 'Query',
  fields: () => ({
    version: {
      type: GraphQLString,
      resolve: () => joinMonster.version
    },
    users: {
      type: new GraphQLList(User),
      resolve: (parent, args, context, resolveInfo) => {
        // joinMonster with handle batching all the data fetching for the users and it's children. Determines everything it needs to from the "resolveInfo", which includes the parsed GraphQL query AST and your schema definition
        // return joinMonster(resolveInfo, context, sql => dbCall(sql, knex, context))
        // console.log(parent, args, context, resolveInfo)
        const data = knex.select().table('accounts')

        if (context && context.response) {
          const sqlString = data.toString();
          context.set('X-SQL-Preview', context.response.get('X-SQL-Preview') + '%0A%0A' + sqlString.replace(/%/g, '%25').replace(/\n/g, '%0A'))
        }
        return data;
      }
    },
    user: {
      type: User,
      args: {
        id: {
          description: 'The users ID number',
          type: new GraphQLNonNull(GraphQLInt)
        }
      },
      // this function generates the WHERE condition
      where: (usersTable, args, context) => { // eslint-disable-line no-unused-vars
        return `${usersTable}.id = ${args.id}`
      },
      resolve: (parent, args, context, resolveInfo) => {
        // return joinMonster(resolveInfo, context, sql => dbCall(sql, knex, context))
        // return joinMonster(resolveInfo, context, sql => dbCall(sql, knex, context))
        // console.log(parent)
      }
    }
  })
})

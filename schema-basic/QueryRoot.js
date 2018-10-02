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

const nestObjectShape = rows => {
  const formattedArray = []
  rows.forEach(row => {
    const {
      id,
      email_address,
      first_name,
      last_name,
      num_legs,
      body,
      post_id,
      author_id,
      archived
    } = row;

    const commentObject = {
      id: id,
      body: body,
      post_id: post_id,
      author_id: author_id,
      archived: archived
    }

    const index = author_id - 1;
    
    if (formattedArray[index]) {
      formattedArray[index] = {
        ...formattedArray[index],
        comments: [
          ...formattedArray[index].comments,
          commentObject
        ]
      }
    } else {
      formattedArray[index] = {
        id: row.author_id,
        email_address,
        first_name,
        last_name,
        num_legs,
        comments: [
          commentObject
        ]
      }
    }
  })

  console.log(formattedArray)
  return formattedArray;
}

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
      resolve: async (parent, args, context, resolveInfo) => {
        const sql = `
          SELECT * FROM accounts a
          LEFT OUTER JOIN comments c ON c.author_id = a.id
        `;

        const rawData = await knex.raw(sql);

        const dataTree = nestObjectShape(rawData);

        return dataTree;
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

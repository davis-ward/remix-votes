import { prisma } from "~/db.server";

export async function getVotes() {
  return prisma.vote.findMany();
}

export async function createRestaurant(vote) {
  return prisma.vote.create({ data: vote })
}

export async function vote(vote) {
  return prisma.vote.update({
    where: { name: vote.name },
    data: vote
  })
}
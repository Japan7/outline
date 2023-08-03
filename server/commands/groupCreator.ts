import { Event, Group, User } from "@server/models";

type Props = {
  user: User;
  name: string;
  ip: string;
};

export default async function groupCreator({
  user,
  name,
  ip,
}: Props): Promise<Group> {
  const g = await Group.create({
    name,
    teamId: user.teamId,
    createdById: user.id,
  });

  // reload to get default scope
  const group = await Group.findByPk(g.id, { rejectOnEmpty: true });

  await Event.create({
    name: "groups.create",
    actorId: user.id,
    teamId: user.teamId,
    modelId: group.id,
    data: {
      name: group.name,
    },
    ip,
  });

  return group;
}

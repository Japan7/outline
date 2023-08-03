import { Event, Group, User } from "@server/models";

type Props = {
  user: User;
  group: Group;
  actor: User;
  ip: string;
};

export default async function groupUserDestroyer({
  user,
  group,
  actor,
  ip,
}: Props): Promise<Group> {
  await group.$remove("user", user);
  await Event.create({
    name: "groups.remove_user",
    userId: user.id,
    modelId: group.id,
    teamId: user.teamId,
    actorId: actor.id,
    data: {
      name: user.name,
    },
    ip,
  });

  // reload to get default scope
  group = await Group.findByPk(group.id, { rejectOnEmpty: true });

  return group;
}

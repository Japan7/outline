import { Event, Group, GroupUser, User } from "@server/models";

type Props = {
  user: User;
  group: Group;
  actor: User;
  ip: string;
};

export default async function groupUserCreator({
  user,
  group,
  actor,
  ip,
}: Props): Promise<{ group: Group; membership: GroupUser }> {
  let membership = await GroupUser.findOne({
    where: {
      groupId: group.id,
      userId: user.id,
    },
  });

  if (!membership) {
    await group.$add("user", user, {
      through: {
        createdById: actor.id,
      },
    });
    // reload to get default scope
    membership = await GroupUser.findOne({
      where: {
        groupId: group.id,
        userId: user.id,
      },
      rejectOnEmpty: true,
    });

    // reload to get default scope
    group = await Group.findByPk(group.id, { rejectOnEmpty: true });

    await Event.create({
      name: "groups.add_user",
      userId: user.id,
      teamId: user.teamId,
      modelId: group.id,
      actorId: actor.id,
      data: {
        name: user.name,
      },
      ip,
    });
  }

  return { group, membership };
}

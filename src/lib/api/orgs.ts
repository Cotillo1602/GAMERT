import { publishers, communityOrganizers, type PublisherAccount } from "../../data/app";
import { players } from "../../data/players";

export type { PublisherAccount } from "../../data/app";

export interface OrganizerAccount {
  id: string;
  name: string;
  games: string[];
  followers: number;
  verified: boolean;
  kind: "editorial" | "comunidad";
}

export async function listOrganizers(): Promise<OrganizerAccount[]> {
  const editorial: OrganizerAccount[] = publishers.map((p) => ({
    id: p.id,
    name: p.name,
    games: p.gameIds,
    followers: p.followers,
    verified: p.verifiedPrizes,
    kind: "editorial",
  }));

  const comunidad: OrganizerAccount[] = communityOrganizers
    .map((id) => players.find((p) => p.id === id))
    .filter((p) => p?.organizer)
    .map((p) => ({
      id: p!.id,
      name: p!.name,
      games: [] as string[],
      followers: p!.organizer!.followers,
      verified: p!.organizer!.verifiedPrizes,
      kind: "comunidad",
    }));

  return [...editorial, ...comunidad];
}

export async function publisherFor(gameId: string): Promise<PublisherAccount | undefined> {
  return Promise.resolve(publishers.find((p) => p.gameIds.includes(gameId)));
}

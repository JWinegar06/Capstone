"use client";

type Collection = {
  id: string;
  libraryId: string;
  name: string;
};

type CollectionListProps = {
  libraryId: string;
  selectedCollectionId?: string;
  onSelectCollection?: (collectionId: string) => void;
};

const sampleCollections: Collection[] = [
  {
    id: "c1",
    libraryId: "1",
    name: "Artifacts",
  },
  {
    id: "c2",
    libraryId: "1",
    name: "Books",
  },
  {
    id: "c3",
    libraryId: "1",
    name: "Checks",
  },
  {
    id: "c4",
    libraryId: "1",
    name: "Maps",
  },
  {
    id: "c5",
    libraryId: "1",
    name: "Photos",
  },
  {
    id: "c6",
    libraryId: "1",
    name: "Post Cards",
  },
  {
    id: "c7",
    libraryId: "1",
    name: "Stock Certificates",
  },

  {
    id: "c8",
    libraryId: "2",
    name: "Books",
  },
  {
    id: "c9",
    libraryId: "2",
    name: "Games",
  },
  {
    id: "c10",
    libraryId: "2",
    name: "Movies",
  },
];

export default function CollectionList({
  libraryId,
  selectedCollectionId,
  onSelectCollection,
}: CollectionListProps) {
  const collections = sampleCollections.filter(
    (collection) => collection.libraryId === libraryId,
  );

  if (collections.length === 0) {
    return <p className="library-placeholder">No collections yet.</p>;
  }

  return (
    <ul className="collection-list">
      {collections.map((collection) => {
        const isSelected = collection.id === selectedCollectionId;

        return (
          <li key={collection.id}>
            <button
              type="button"
              className={`collection-button ${isSelected ? "active" : ""}`}
              onClick={() => onSelectCollection?.(collection.id)}
            >
              {collection.name}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

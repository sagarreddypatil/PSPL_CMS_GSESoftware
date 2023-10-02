import { useEffect, useState } from "react";
import { pb } from "../Login";

export type RecordBase = {
  id: string;
  created?: Date;
  updated?: Date;
};

export function useRecord<Type extends RecordBase>(
  collection: string,
  id: string
) {
  const [record, _setRecord] = useState<Type | null>(null);

  useEffect(() => {
    pb.collection(collection)
      .getOne<Type>(id)
      .then((res) => {
        _setRecord(res);
      })
      .catch((err) => {
        console.error(err);
      });

    pb.collection(collection).subscribe<Type>(id, (res) => {
      if (res.action === "delete") {
        _setRecord(null);
        return;
      }

      _setRecord(res.record);
    });

    return () => {
      pb.collection(collection).unsubscribe(id);
    };
  }, [collection, id]);

  const setRecord = (record: Type) => {
    return pb
      .collection(collection)
      .update<Type>(id, record as { [key: string]: any })
      .catch((err) => {
        console.error(err);
      });
  };

  return [record, setRecord] as const;
}

export function useRecords<Type extends RecordBase>(collection: string) {
  const [records, _setRecords] = useState<Type[]>([]);

  useEffect(() => {
    pb.collection(collection)
      .getFullList<Type>()
      .then((res) => {
        _setRecords(res);
      });

    pb.collection(collection).subscribe<Type>("*", (res) => {
      if (res.action === "delete") {
        _setRecords((records) =>
          records.filter((record) => record.id !== res.record.id)
        );
        return;
      }
      if (res.action === "update") {
        _setRecords((records) =>
          records.map((record) =>
            record.id === res.record.id ? res.record : record
          )
        );
        return;
      }
      if (res.action === "create") {
        _setRecords((records) => [...records, res.record]);
        return;
      }
    });

    return () => {
      pb.collection(collection).unsubscribe("*");
    };
  }, [collection]);

  const createRecord = (record: Type) => {
    return pb
      .collection(collection)
      .create<Type>(record as { [key: string]: any })
      .catch((err) => {
        console.error(err);
      });
  };

  const deleteRecord = (id: string) => {
    return pb
      .collection(collection)
      .delete(id)
      .catch((err) => {
        console.error(err);
      });
  };

  const updateRecord = (record: Type) => {
    return pb
      .collection(collection)
      .update<Type>(record.id, record as { [key: string]: any })
      .catch((err) => {
        console.error(err);
      });
  };

  return [records, createRecord, updateRecord, deleteRecord] as const;
}

import { useEffect, useState } from "react";
import { pb } from "../Login";

export type RecordBase = {
  id: string;
  created?: Date;
  updated?: Date;
};

export function usePbRecord<Type extends RecordBase>(
  collection: string,
  id: string
) {
  const [record, _setRecord] = useState<Type | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    pb.collection(collection)
      .getOne<Type>(id)
      .then((res) => {
        _setRecord(res);
        setLoading(false);
      })
      .catch((err) => {
        _setRecord(null);
        setError(true);
        setLoading(false);
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

  const setRecord = (newRecord: Type) => {
    return pb
      .collection(collection)
      .update<Type>(id, newRecord as { [key: string]: any })
      .catch((err) => {
        console.error(err);
      });
  };

  return {
    loading,
    error,
    record,
    setRecord,
  };
}

export function usePbRecords<Type extends RecordBase>(collection: string) {
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

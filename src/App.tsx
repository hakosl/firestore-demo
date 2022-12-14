import { FormEvent, useEffect, useState } from 'react';
import './App.css';
import { DeleteIcon } from './components/DeleteIcon';
import firestoreService, {
  addThing,
  deleteThing,
  onThingsUpdate,
  Thing,
  ThingWithId,
} from './services/firestore';

function App() {
  const [things, setThings] = useState<ThingWithId[]>([]);
  const [text, setText] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onThingsUpdate(
      (thingsSnap) => {
        const things = thingsSnap.docs.map((thing) => {
          return { ...(thing.data() as Thing), id: thing.id };
        });

        setError('');
        setThings(things);
        setLoading(false);
      },
      () => {
        setError('Could not get things');
      },
    );

    return unsubscribe;
  }, []);

  const newThing = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!text) return;
    addThing(text);
    setText('');
  };

  if (error) return <p>{error}</p>;

  return (
    <div className='App card bg-neutral text-neutral-content w-96 m-auto'>
      <div className='card-body flex flex-col items-start gap-2'>
        <form className='input-group justify-center' onSubmit={newThing}>
          <input
            type='text'
            id='thingInput'
            placeholder='Legg til en ny ting'
            value={text}
            onChange={(text) => setText(text.target.value)}
            className='input input-bordered w-full'
          />
          <button disabled={!text} className='btn btn-primary' type='submit'>
            Add
          </button>
        </form>
        <div className='divider'></div>
        {!loading || <button className='btn btn-square loading'></button>}
        {loading || things.map((thing) => <ThingItem key={thing.id} thing={thing} />)}
      </div>
    </div>
  );
}

export default App;

interface ThingItemProps {
  thing: ThingWithId;
}

function ThingItem({ thing }: ThingItemProps): JSX.Element {
  const [newThing, setNewThing] = useState(thing.content);

  useEffect(() => {
    setNewThing(thing.content);
  }, [thing.content]);

  const removeThing = async (thingId: string) => {
    await deleteThing(thingId);
  };

  const editThing = async (thingId: string) => {
    if (!newThing) return;
    await firestoreService.editThing(thingId, newThing);
  };

  return (
    <div key={thing.id} className='alert shadow-lg break-words'>
      <input
        className={`input input-bordered w-full max-w-xs ${newThing ? '' : 'border-red-500'}`}
        type='text'
        value={newThing}
        onChange={(event) => {
          setNewThing(event.target.value);
        }}
      ></input>
      <button
        disabled={!newThing || newThing === thing.content}
        onClick={() => editThing(thing.id)}
        className='btn btn-sm btn-success'
      >
        Edit
      </button>
      <button onClick={() => removeThing(thing.id)} className='btn btn-square btn-sm btn-error'>
        <DeleteIcon />
      </button>
    </div>
  );
}

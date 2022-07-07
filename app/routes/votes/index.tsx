import { json, LoaderFunction, Response } from "@remix-run/node";
import { useFetcher, useLoaderData, useTransition } from "@remix-run/react";
import React, { useEffect } from "react";

import { createRestaurant, getVotes, vote } from "~/models/vote.server";

const inputClassName = `w-full rounded border border-gray-500 px-2 py-1 text-lg`;

type Vote = {
  name: string;
  votes: number;
};

type LoaderData = {
  // fancy way of saying 'votes is whatever type getVotes resolves to'
  posts: Awaited<ReturnType<typeof getVotes>>;
};

function VoteItem({ vote }) {
  const updateFetcher = useFetcher();
  const updateFormRef = React.useRef<HTMLFormElement>(null);

  const isCreating = updateFetcher.state === 'submitting';

  return (
    <li className="mt-4" key={vote.name}>
      <updateFetcher.Form
        method="post"
        ref={updateFormRef}
        className="flex"
      >
        <div className="flex-initial mr-3">&#127869;</div>
        <h3 className="flex-1 text-large">{vote.name}</h3>
        <input type="hidden" name="restaurant" value={vote.name}/>
        <input type="number" value={vote.votes} name="votes" className="flex-1 text-large"/>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-0.5 px-2 rounded-full flex-1"
          type="submit"
          name="intent"
          value="vote"
          disabled={isCreating}
          >{isCreating ? (<span>Voting! &#128640;</span>) : 'Vote'}</button>

      </updateFetcher.Form>
    </li>
  )
}

export default function Votes() {
  const { votes } = useLoaderData() as LoaderData;

  const updateFetcher = useFetcher();
  const updateFormRef = React.useRef<HTMLFormElement>(null);

  let isCreating = false;
  if (updateFetcher.state === 'submitting') {
    isCreating = true;
  }

  const createFormRef = React.useRef<HTMLFormElement>(null);
  const createFetcher = useFetcher();

  useEffect(() => {
    if (createFetcher.state !== 'submitting') {
      createFormRef.current?.reset();
      optimisticAdd = null;
    }
  }, [createFetcher.state === 'submitting']);

  let optimisticAdd;
  if (createFetcher.state === 'submitting') {
    const vote = {
      name: createFetcher.submission.formData.get('restaurant'),
      votes: 0
    };
    optimisticAdd = <VoteItem vote={vote}></VoteItem>
  }

  return (
    <main className="flex justify-center mt-32">
      <div>
      <h1 className="mb-3 text-center font-bold text-lg">Votes</h1>
      <ul className="flex flex-col">
        {votes.map((vote: Vote) => (
          <VoteItem vote={vote} key={vote.name}></VoteItem>
        ))}
        {optimisticAdd}
      </ul>
      <createFetcher.Form
      ref={createFormRef}
      method="post"
      className="mt-5"
      >
        <input type="hidden" name="intent" value="createRestaurant"/>
        <input type="text" name="restaurant" className={inputClassName} placeholder="Add a new Restaurant"/>
        <button type="submit" className=" mt-1 rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400 disabled:bg-blue-300"
          >{createFetcher.data?.error ? 'Try Again' : 'Create Restaurant'}</button>
      </createFetcher.Form>
      </div>
    </main>
  );
}

export const loader: LoaderFunction = async () => {
  return json<LoaderData>({
    votes: await getVotes(),
  });
};

export const action = async ({ request }) => {

  // remove me
  await new Promise((res) => setTimeout(res, 1000));

  const formData = await request.formData();

  const intent = formData.get("intent");
  const name = formData.get("restaurant");

  switch (intent) {
    case "createRestaurant": {
      try {
        // comment this out
        throw new Error('KaBoom!');

        const votes = 0;
        await createRestaurant({ name, votes });
        return new Response("ok");
      } catch (e) {
        return { error: true };
      }
    }

    case "vote": {
      const votes = parseInt(formData.get("votes")) + 1;
      await vote({ name, votes });

      return new Response("ok");
    }
  }

};


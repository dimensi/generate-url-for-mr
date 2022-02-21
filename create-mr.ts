import axiod from "https://deno.land/x/axiod/mod.ts";
import { clipboard } from "./clipboards.ts";

try {
  const gitlabProject = 452;
  let sourceBranch = "";
  let message = ''
  const gitBranch = Deno.run({
    cmd: ["git", "branch", "--show-current"],
    cwd: "../akit/",
    stdout: "piped",
    stderr: "piped",
  });

  const gitLastMessage = Deno.run({
    cmd: ["git", "log", "-1", "--pretty=%B"],
    cwd: "../akit/",
    stdout: "piped",
    stderr: "piped",
  });

  const { code } = await gitBranch.status();
  const { code: codeMessage } = await gitLastMessage.status();

  if (code === 0 && codeMessage === 0) {
    sourceBranch = new TextDecoder().decode(await gitBranch.output()).trim()
    message = new TextDecoder().decode(await gitLastMessage.output()).trim()
  } else {
    console.log("не смог получить ветку");
    Deno.exit(1);
  }

  console.log(sourceBranch, message)

  const api = axiod.create({
    baseURL: "http://gitlab.k8s.alfa.link/api/v4",
    headers: {
      authorization: `Bearer _yDp9h_ziBQz9FaZ_4fN`,
    },
  });

  function getMe() {
    return api.get<{ id: string }>("/user").then((r) => r.data);
  }

  async function findMrBranch() {
    const result = await api
      .get<{ web_url: string }[]>(`/projects/${gitlabProject}/merge_requests`, {
        params: {
          source_branch: sourceBranch,
          target_branch: "master",
        },
      })
      .then((r) => r.data);
    return result[0] ?? null;
  }

  async function createMr() {
    const jiraTaskName = sourceBranch.replace(/feature\/bugfix\//, "");
    const [firstPart, secondPart] = sourceBranch.trim().split('/')
    const number = secondPart.replace('ALFABANKRU-', '')
    const me = await getMe();
    let mr = await findMrBranch();

    if (!mr) {
      mr = await api
        .post<{ web_url: string }>(
          `/projects/${gitlabProject}/merge_requests`,
          {
            source_branch: sourceBranch,
            target_branch: "master",
            title: message,
            assignee_id: me.id,
            description: `## Задача

[]

## Решение

[]

## Стенд

http://akit-${firstPart}-alfabankru-${number}.reviews.ci.k8ng.alfa.link/api/akit/


Closes ${jiraTaskName}`,
            remove_source_branch: true,
            squash: true,
          }
        )
        .then((r) => r.data);
    }

    return mr.web_url;
  }

  const link = await createMr();
  console.log("ссылка на мр " + link);
  await clipboard.writeText(link);
} catch (err) {
  console.error(err);
}

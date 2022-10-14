const express = require("express");

const { v4: uuid, validate } = require("uuid");

const app = express();

app.use(express.json());

const repositories = [];

function verifyRepository(request, response, next) {
  const { id } = request.params;

  const user = repositories.find((repository) => repository.id === id);

  if (!user) {
    return response.status(404).json({ error: "Repository not found" });
  }
  request.user = user;
  return next();
}

app.get("/repositories", (request, response) => {
  return response.json(repositories);
});

app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body;

  const repository = {
    id: uuid(),
    title,
    url,
    techs,
    likes: 0,
  };
  repositories.push(repository);

  return response.status(201).json(repository);
});

app.put("/repositories/:id", verifyRepository, (request, response) => {
  const { user } = request;
  const updatedRepository = request.body;

  const repositoryIndex = repositories.findIndex(
    (repository) => repository.id === user.id,
  );
  const newRepository = {
    id: user.id,
    title: updatedRepository.title ?? user.title,
    url: updatedRepository.url ?? user.url,
    techs: updatedRepository.techs ?? user.techs,
    likes: user.likes,
  };

  repositories[repositoryIndex] = newRepository;

  return response.json(newRepository);
});

app.delete("/repositories/:id", (request, response) => {
  const { id } = request.params;

  const repositoryIndex = repositories.findIndex(
    (repository) => repository.id === id,
  );

  if (repositoryIndex < 0) {
    return response.status(404).json({ error: "Repository not found" });
  }

  repositories.splice(repositoryIndex, 1);

  return response.status(204).send();
});

app.post("/repositories/:id/like", verifyRepository, (request, response) => {
  const { user } = request;
  const repositoryIndex = repositories.findIndex(
    (repository) => repository.id === user.id,
  );

  const likes = ++repositories[repositoryIndex].likes;

  repositories[repositoryIndex].likes = likes;

  return response.json(repositories[repositoryIndex]);
});

module.exports = app;

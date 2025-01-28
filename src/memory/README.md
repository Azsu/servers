# Knowledge Graph Memory Server
A sophisticated implementation of persistent memory using a local knowledge graph. This system enables Claude to maintain a rich, interconnected graph of information about the user across conversations.

## Core Concepts

### Entities
Entities are the primary nodes in the knowledge graph. Each entity has:
- A unique name (identifier)
- An entity type (e.g., "person", "organization", "skill", "project")
- A list of observations
- Optional metadata (dates, descriptions, etc.)

Example:
```json
{
  "name": "Python_Development",
  "entityType": "skill",
  "observations": ["Expert-level proficiency in Python development"],
  "metadata": {
    "startDate": "2018-01",
    "description": "Full-stack Python development including Django and FastAPI"
  }
}
```

### Relations
Relations define directed connections between entities. They are stored in active voice and describe how entities interact or relate to each other. Relations can include:
- Source entity (from)
- Target entity (to)
- Relation type
- Optional metadata (context, dates, etc.)

Example:
```json
{
  "from": "Senior_Developer_Role",
  "to": "Python_Development",
  "relationType": "HasSkill",
  "metadata": {
    "level": "EXPERT",
    "context": "Led team of Python developers",
    "startDate": "2020-01",
    "endDate": "2023-06"
  }
}
```

### Enhanced Relation Types

#### Experience-Skill Relations
Maps skills to specific work experiences with proficiency levels:
- Links skills to work experiences
- Tracks skill levels (BEGINNER, INTERMEDIATE, ADVANCED, EXPERT)
- Includes context and duration
- Enables skill progression tracking

#### Project-Experience Relations
Links projects to work experiences:
- Connects projects to specific roles
- Captures role and responsibilities
- Tracks impact and outcomes
- Builds project portfolio

#### Cross-Reference Relations
Creates connections between different entity types:
- Supports various entity types (WORK_EXPERIENCE, PROJECT, SKILL, EDUCATION, CONTRIBUTION)
- Defines relationship types (SUPPORTS, PREREQUISITES, LEADS_TO, RELATED)
- Adds context to connections
- Enables graph traversal

#### Contribution-Experience Relations
Links online contributions to work experiences:
- Connects contributions to roles
- Captures relevance and demonstrated skills
- Builds evidence portfolio
- Tracks skill demonstrations

## API

### Entity Management
- **create_entities**: Create multiple new entities
- **delete_entities**: Remove entities and their relations
- **add_observations**: Add observations to existing entities
- **delete_observations**: Remove specific observations
- **search_nodes**: Search across entity names, types, and observations

### Relation Management
- **create_experience_skill_relation**: Link skills to work experiences
- **create_project_experience_relation**: Connect projects to work experiences
- **create_cross_reference_relation**: Create connections between any entities
- **create_contribution_experience_relation**: Link contributions to experiences

### Querying
- **get_skills_for_experience**: Get skills used in a work experience
- **get_projects_for_experience**: Get projects associated with a role
- **get_related_entities**: Find all entities connected to a specific entity
- **get_contributions_for_experience**: Get contributions from a work experience
- **calculate_experience**: Calculate total experience with a technology
- **calculate_skill_metrics**: Get detailed metrics for a skill

### Experience Types
The system supports various types of experiences:
- Work Experience
- Education Experience
- Career Breaks
- Projects
- Online Contributions
- Licenses & Certifications
- Courses
- Organizations
- Honors & Awards

Each type has specific attributes and can be interconnected through relations.

## Usage with Claude Desktop

### Setup

Add this to your claude_desktop_config.json:

#### Docker

```json
{
  "mcpServers": {
    "memory": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "mcp/memory"]
    }
  }
}
```

#### NPX
```json
{
  "mcpServers": {
    "memory": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-memory"
      ]
    }
  }
}
```

### System Prompt

The prompt for utilizing memory depends on the use case. Changing the prompt will help the model determine the frequency and types of memories created.

Here is an example prompt for chat personalization. You could use this prompt in the "Custom Instructions" field of a [Claude.ai Project](https://www.anthropic.com/news/projects).

```
Follow these steps for each interaction:

1. User Identification:
   - You should assume that you are interacting with default_user
   - If you have not identified default_user, proactively try to do so.

2. Memory Retrieval:
   - Always begin your chat by saying only "Remembering..." and retrieve all relevant information from your knowledge graph
   - Always refer to your knowledge graph as your "memory"

3. Memory
   - While conversing with the user, be attentive to any new information that falls into these categories:
     a) Basic Identity (age, gender, location, job title, education level, etc.)
     b) Behaviors (interests, habits, etc.)
     c) Preferences (communication style, preferred language, etc.)
     d) Goals (goals, targets, aspirations, etc.)
     e) Relationships (personal and professional relationships up to 3 degrees of separation)

4. Memory Update:
   - If any new information was gathered during the interaction, update your memory as follows:
     a) Create entities for recurring organizations, people, and significant events
     b) Connect them to the current entities using relations
     b) Store facts about them as observations
```

## Building

Docker:

```sh
docker build -t mcp/memory -f src/memory/Dockerfile .
```

## License

This MCP server is licensed under the MIT License. This means you are free to use, modify, and distribute the software, subject to the terms and conditions of the MIT License. For more details, please see the LICENSE file in the project repository.
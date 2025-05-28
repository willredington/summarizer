# RuboCop: Ruby Style Guide Enforcement and Linting Tool

# RuboCop: Ruby Style Guide Enforcement and Linting Tool

## Overview

RuboCop is a Ruby static code analyzer and formatter that enforces the Ruby Style Guide. It's particularly useful for maintaining consistent code style across teams and catching potential issues early in development.

## Installation

### Adding to Gemfile
```ruby
group :development do
  gem 'rubocop', require: false
end
```

### Direct Installation
```bash
gem install rubocop
```

## Basic Usage

### Running RuboCop
```bash
# Check all Ruby files in current directory
rubocop

# Check specific files or directories
rubocop app spec lib/something.rb

# Auto-correct offenses (safe corrections only)
rubocop -a
# or
rubocop --auto-correct

# Auto-correct all offenses (including unsafe)
rubocop -A
# or
rubocop --auto-correct-all
```

## Configuration

### Creating .rubocop.yml
RuboCop uses a `.rubocop.yml` file for configuration. Here's a comprehensive example:

```yaml
# Specify Ruby version
AllCops:
  TargetRubyVersion: 3.0
  NewCops: enable
  Exclude:
    - 'vendor/**/*'
    - 'db/**/*'
    - 'bin/**/*'
    - 'node_modules/**/*'

# Style configurations
Style/StringLiterals:
  Enabled: true
  EnforcedStyle: double_quotes

Style/FrozenStringLiteralComment:
  Enabled: true
  EnforcedStyle: always

# Metrics configurations
Metrics/MethodLength:
  Max: 15

Metrics/ClassLength:
  Max: 150

Metrics/AbcSize:
  Max: 20

# Layout configurations
Layout/LineLength:
  Max: 120
  Exclude:
    - 'spec/**/*'

# Naming configurations
Naming/MethodName:
  Enabled: true
  EnforcedStyle: snake_case
```

## Key Cop Categories

### 1. **Style Cops**
Enforce Ruby style guide conventions:
```ruby
# Bad
array = ['a', 'b', 'c']

# Good (with Style/StringLiterals: double_quotes)
array = ["a", "b", "c"]
```

### 2. **Layout Cops**
Handle code formatting:
```ruby
# Bad
def method(arg1,arg2)
  arg1+arg2
end

# Good
def method(arg1, arg2)
  arg1 + arg2
end
```

### 3. **Metrics Cops**
Measure code complexity:
- **AbcSize**: Assignment, Branch, Condition complexity
- **CyclomaticComplexity**: Number of linearly independent paths
- **MethodLength**: Lines in a method
- **ClassLength**: Lines in a class

### 4. **Lint Cops**
Detect potential errors:
```ruby
# Bad - unreachable code
def example
  return true
  puts "This won't execute"
end

# Bad - unused variable
def calculate
  result = 5 + 5
  10
end
```

### 5. **Security Cops**
Identify security vulnerabilities:
```ruby
# Bad
eval(user_input)

# Bad - potential SQL injection
User.where("name = '#{params[:name]}'")

# Good
User.where(name: params[:name])
```

## Advanced Configuration

### Inheritance
```yaml
inherit_from:
  - .rubocop_todo.yml
  - .rubocop_shared.yml

inherit_gem:
  my-shared-gem: config/rubocop.yml
```

### Custom Cops
Create custom cops for organization-specific rules:

```ruby
# lib/rubocop/cop/custom/no_puts.rb
module RuboCop
  module Cop
    module Custom
      class NoPuts < Base
        MSG = 'Avoid using puts in production code'

        def on_send(node)
          return unless node.method_name == :puts
          add_offense(node)
        end
      end
    end
  end
end
```

### Disabling Cops
```ruby
# Disable for entire file
# rubocop:disable Metrics/MethodLength

# Disable for specific lines
method_call # rubocop:disable Style/SomeRule

# Disable for block
# rubocop:disable Metrics/AbcSize
def complex_method
  # complex logic here
end
# rubocop:enable Metrics/AbcSize
```

## Integration with CI/CD

### GitLab CI Example
```yaml
rubocop:
  stage: test
  script:
    - bundle exec rubocop --format progress --format json --out rubocop.json
  artifacts:
    paths:
      - rubocop.json
    reports:
      codequality: rubocop.json
```

### Pre-commit Hook
```bash
#!/bin/sh
# .git/hooks/pre-commit
files=$(git diff --cached --name-only --diff-filter=ACM | grep '\.rb$')
if [ -n "$files" ]; then
  bundle exec rubocop $files
fi
```

## Performance Optimization

### Caching
```bash
# Enable caching
rubocop --cache true

# Clear cache
rubocop --cache false
```

### Parallel Execution
```bash
# Use all available cores
rubocop --parallel

# Specify number of workers
rubocop --parallel 4
```

## Common Patterns for Non-Rails Ruby Projects

### Configuration for Pure Ruby
```yaml
AllCops:
  TargetRubyVersion: 3.0
  NewCops: enable
  Exclude:
    - 'vendor/**/*'
    - 'spec/**/*_spec.rb'

# Disable Rails-specific cops
Rails:
  Enabled: false

# Useful for scripts and tools
Style/TopLevelMethodDefinition:
  Enabled: false

Style/GlobalVars:
  AllowedVariables:
    - $logger
    - $config
```

## Best Practices

1. **Start with RuboCop's defaults** and customize gradually
2. **Use rubocop-todo.yml** for gradual adoption:
   ```bash
   rubocop --auto-gen-config
   ```
3. **Document cop disabling** with clear reasons
4. **Run RuboCop in CI** to catch issues early
5. **Use auto-correct cautiously** - review changes
6. **Keep RuboCop updated** for latest Ruby syntax support

## Useful Commands

```bash
# Show all cops
rubocop --show-cops

# Generate default configuration
rubocop --init

# Format output
rubocop --format fuubar
rubocop --format html -o rubocop.html

# Only run specific cops
rubocop --only Style/StringLiterals,Layout/LineLength

# Lint changed files only (Git)
rubocop $(git diff --name-only --diff-filter=d main...HEAD | grep '\.rb$')
```

## Tags
- ruby
- linting
- code-quality
- static-analysis
- style-guide
- development-tools
- best-practices
-- Exam status enum
CREATE TYPE exam_status AS ENUM ('draft','published','live','completed','cancelled');

-- Question type enum
CREATE TYPE question_type AS ENUM ('mcq','descriptive','true_false','fill_blank','coding');

-- Exams table
CREATE TABLE IF NOT EXISTS exams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  instructions TEXT,
  duration_minutes INTEGER NOT NULL,
  total_marks INTEGER NOT NULL,
  pass_marks INTEGER,
  negative_marking DECIMAL(4,2) DEFAULT 0,
  shuffle_questions BOOLEAN DEFAULT FALSE,
  shuffle_options BOOLEAN DEFAULT FALSE,
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  status exam_status DEFAULT 'draft',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type question_type NOT NULL,
  options JSONB,
  correct_answer JSONB NOT NULL,
  marks INTEGER NOT NULL DEFAULT 1,
  negative_marks DECIMAL(4,2) DEFAULT 0,
  difficulty VARCHAR(10) DEFAULT 'medium',
  subject VARCHAR(255),
  topic VARCHAR(255),
  explanation TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Exam attempts
CREATE TABLE IF NOT EXISTS exam_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_id UUID REFERENCES exams(id),
  candidate_id UUID REFERENCES users(id),
  started_at TIMESTAMP DEFAULT NOW(),
  submitted_at TIMESTAMP,
  status VARCHAR(20) DEFAULT 'in_progress',
  score DECIMAL(10,2),
  answers JSONB DEFAULT '{}',
  tab_switches INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(exam_id, candidate_id)
);

-- Results table
CREATE TABLE IF NOT EXISTS results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attempt_id UUID REFERENCES exam_attempts(id),
  candidate_id UUID REFERENCES users(id),
  exam_id UUID REFERENCES exams(id),
  total_score DECIMAL(10,2),
  percentage DECIMAL(5,2),
  percentile DECIMAL(5,2),
  rank INTEGER,
  is_passed BOOLEAN,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
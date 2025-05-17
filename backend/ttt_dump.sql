--
-- PostgreSQL database dump
--

-- Dumped from database version 16.8
-- Dumped by pg_dump version 16.8

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: delete_room_if_empty(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.delete_room_if_empty() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM room_members WHERE room_id = OLD.room_id
  ) THEN
    DELETE FROM rooms WHERE id = OLD.room_id;
  END IF;
  RETURN NULL;
END;
$$;


ALTER FUNCTION public.delete_room_if_empty() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: game_results; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.game_results (
    id integer NOT NULL,
    game_id uuid NOT NULL,
    user_id uuid NOT NULL,
    opponent_id uuid,
    result text,
    CONSTRAINT game_results_result_check CHECK ((result = ANY (ARRAY['win'::text, 'lose'::text, 'draw'::text])))
);


ALTER TABLE public.game_results OWNER TO postgres;

CREATE SEQUENCE public.game_results_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.game_results_id_seq OWNER TO postgres;

ALTER SEQUENCE public.game_results_id_seq OWNED BY public.game_results.id;

ALTER TABLE ONLY public.game_results ALTER COLUMN id SET DEFAULT nextval('public.game_results_id_seq'::regclass);

--
-- Name: games; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.games (
    id uuid NOT NULL,
    room_id uuid,
    started_at timestamp with time zone DEFAULT now(),
    ended_at timestamp with time zone,
    is_difficult boolean NOT NULL
);


ALTER TABLE public.games OWNER TO postgres;

--
-- Name: room_members; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.room_members (
    id integer NOT NULL,
    room_id uuid NOT NULL,
    user_id uuid NOT NULL,
    joined_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.room_members OWNER TO postgres;

CREATE SEQUENCE public.room_members_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.room_members_id_seq OWNER TO postgres;

ALTER SEQUENCE public.room_members_id_seq OWNED BY public.room_members.id;

ALTER TABLE ONLY public.room_members ALTER COLUMN id SET DEFAULT nextval('public.room_members_id_seq'::regclass);

--
-- Name: rooms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rooms (
    id uuid NOT NULL,
    name character varying(150) NOT NULL,
    is_difficult boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.rooms OWNER TO postgres;

--
-- Name: user_stats; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_stats (
    id integer NOT NULL,
    user_id uuid NOT NULL,
    games_played integer DEFAULT 0 NOT NULL,
    wins integer DEFAULT 0 NOT NULL,
    losses integer DEFAULT 0 NOT NULL,
    draws integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.user_stats OWNER TO postgres;

CREATE SEQUENCE public.user_stats_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_stats_id_seq OWNER TO postgres;

CREATE OR REPLACE FUNCTION public.update_total_games()
RETURNS TRIGGER AS $$
BEGIN
    NEW.games_played = NEW.wins + NEW.losses + NEW.draws;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

ALTER FUNCTION public.update_total_games() OWNER TO postgres;

--
-- Name: user_company_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_stats_id_seq OWNED BY public.user_stats.id;

ALTER TABLE ONLY public.user_stats ALTER COLUMN id SET DEFAULT nextval('public.user_stats_id_seq'::regclass);

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    username character varying(100) NOT NULL,
    password text NOT NULL,
    avatar_url text,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Data for Name: game_results; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.game_results (game_id, user_id, opponent_id, result) FROM stdin;
\.


--
-- Data for Name: games; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.games (id, room_id, started_at, ended_at, is_difficult) FROM stdin;
\.


--
-- Data for Name: room_members; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.room_members (room_id, user_id, joined_at) FROM stdin;
\.


--
-- Data for Name: rooms; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rooms (id, name, is_difficult, created_at) FROM stdin;
\.


--
-- Data for Name: user_stats; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_stats (user_id, games_played, wins, losses, draws) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, password, avatar_url, created_at) FROM stdin;
\.


--
-- Name: game_results game_results_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.game_results
    ADD CONSTRAINT game_results_pkey PRIMARY KEY (game_id, user_id);


--
-- Name: games games_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.games
    ADD CONSTRAINT games_id_key UNIQUE (id);


--
-- Name: room_members room_members_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.room_members
    ADD CONSTRAINT room_members_pkey PRIMARY KEY (room_id, user_id);


--
-- Name: rooms rooms_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT rooms_id_key UNIQUE (id);


--
-- Name: rooms rooms_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT rooms_name_key UNIQUE (name);


--
-- Name: user_stats user_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_stats
    ADD CONSTRAINT user_stats_pkey PRIMARY KEY (user_id);


--
-- Name: users users_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_id_key UNIQUE (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: room_members trigger_delete_room_if_empty; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_delete_room_if_empty AFTER DELETE ON public.room_members FOR EACH ROW EXECUTE FUNCTION public.delete_room_if_empty();
CREATE TRIGGER trigger_update_total_games
BEFORE INSERT OR UPDATE OF wins, losses, draws ON public.user_stats
FOR EACH ROW
EXECUTE FUNCTION public.update_total_games();

--
-- Name: game_results game_results_game_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.game_results
    ADD CONSTRAINT game_results_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.games(id) ON DELETE CASCADE;


--
-- Name: game_results game_results_opponent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.game_results
    ADD CONSTRAINT game_results_opponent_id_fkey FOREIGN KEY (opponent_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: game_results game_results_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.game_results
    ADD CONSTRAINT game_results_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: games games_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.games
    ADD CONSTRAINT games_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id) ON DELETE SET NULL;


--
-- Name: room_members room_members_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.room_members
    ADD CONSTRAINT room_members_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id) ON DELETE CASCADE;


--
-- Name: room_members room_members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.room_members
    ADD CONSTRAINT room_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_stats user_stats_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_stats
    ADD CONSTRAINT user_stats_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

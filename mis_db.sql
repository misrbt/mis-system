--
-- PostgreSQL database dump
--

\restrict xtLheUcGFYaeEgX5Hh0JpDiB81HzMqhIx8Kg6ejMYFt2cR88Jk8Jm2LASurXtrY

-- Dumped from database version 18.0
-- Dumped by pg_dump version 18.0

-- Started on 2026-01-07 09:29:51

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 243 (class 1259 OID 43151)
-- Name: asset_category; Type: TABLE; Schema: public; Owner: super_admin
--

CREATE TABLE public.asset_category (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    code character varying(50)
);


ALTER TABLE public.asset_category OWNER TO super_admin;

--
-- TOC entry 242 (class 1259 OID 43150)
-- Name: asset_category_id_seq; Type: SEQUENCE; Schema: public; Owner: super_admin
--

CREATE SEQUENCE public.asset_category_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.asset_category_id_seq OWNER TO super_admin;

--
-- TOC entry 5209 (class 0 OID 0)
-- Dependencies: 242
-- Name: asset_category_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: super_admin
--

ALTER SEQUENCE public.asset_category_id_seq OWNED BY public.asset_category.id;


--
-- TOC entry 253 (class 1259 OID 50394)
-- Name: asset_movements; Type: TABLE; Schema: public; Owner: super_admin
--

CREATE TABLE public.asset_movements (
    id bigint NOT NULL,
    asset_id bigint NOT NULL,
    movement_type character varying(255) NOT NULL,
    from_employee_id bigint,
    to_employee_id bigint,
    from_status_id bigint,
    to_status_id bigint,
    from_branch_id bigint,
    to_branch_id bigint,
    repair_id bigint,
    performed_by_user_id bigint,
    reason text,
    remarks text,
    metadata json,
    movement_date timestamp(0) without time zone NOT NULL,
    ip_address inet,
    user_agent character varying(255),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone,
    CONSTRAINT asset_movements_movement_type_check CHECK (((movement_type)::text = ANY (ARRAY['created'::text, 'assigned'::text, 'transferred'::text, 'returned'::text, 'status_changed'::text, 'repair_initiated'::text, 'repair_completed'::text, 'repair_deleted'::text, 'updated'::text, 'disposed'::text, 'code_generated'::text, 'inventory_operation'::text, 'repair_in_progress'::text, 'repair_returned'::text, 'repair_status_changed'::text, 'repair_updated'::text, 'repair_remark_added'::text])))
);


ALTER TABLE public.asset_movements OWNER TO super_admin;

--
-- TOC entry 252 (class 1259 OID 50393)
-- Name: asset_movements_id_seq; Type: SEQUENCE; Schema: public; Owner: super_admin
--

CREATE SEQUENCE public.asset_movements_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.asset_movements_id_seq OWNER TO super_admin;

--
-- TOC entry 5210 (class 0 OID 0)
-- Dependencies: 252
-- Name: asset_movements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: super_admin
--

ALTER SEQUENCE public.asset_movements_id_seq OWNED BY public.asset_movements.id;


--
-- TOC entry 249 (class 1259 OID 43218)
-- Name: assets; Type: TABLE; Schema: public; Owner: super_admin
--

CREATE TABLE public.assets (
    id bigint NOT NULL,
    asset_name character varying(255) NOT NULL,
    asset_category_id bigint NOT NULL,
    brand character varying(255),
    model character varying(255),
    book_value double precision,
    serial_number character varying(255),
    purchase_date date,
    acq_cost double precision,
    waranty_expiration_date date,
    estimate_life integer,
    vendor_id bigint,
    status_id bigint NOT NULL,
    remarks text,
    assigned_to_employee_id bigint,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    qr_code text,
    barcode text
);


ALTER TABLE public.assets OWNER TO super_admin;

--
-- TOC entry 5211 (class 0 OID 0)
-- Dependencies: 249
-- Name: COLUMN assets.qr_code; Type: COMMENT; Schema: public; Owner: super_admin
--

COMMENT ON COLUMN public.assets.qr_code IS 'Base64 encoded QR code image';


--
-- TOC entry 5212 (class 0 OID 0)
-- Dependencies: 249
-- Name: COLUMN assets.barcode; Type: COMMENT; Schema: public; Owner: super_admin
--

COMMENT ON COLUMN public.assets.barcode IS 'Base64 encoded barcode image';


--
-- TOC entry 248 (class 1259 OID 43217)
-- Name: assets_id_seq; Type: SEQUENCE; Schema: public; Owner: super_admin
--

CREATE SEQUENCE public.assets_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.assets_id_seq OWNER TO super_admin;

--
-- TOC entry 5213 (class 0 OID 0)
-- Dependencies: 248
-- Name: assets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: super_admin
--

ALTER SEQUENCE public.assets_id_seq OWNED BY public.assets.id;


--
-- TOC entry 235 (class 1259 OID 43111)
-- Name: branch; Type: TABLE; Schema: public; Owner: super_admin
--

CREATE TABLE public.branch (
    id bigint NOT NULL,
    branch_name character varying(255) NOT NULL,
    brak character varying(255) NOT NULL,
    brcode character varying(255) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.branch OWNER TO super_admin;

--
-- TOC entry 234 (class 1259 OID 43110)
-- Name: branch_id_seq; Type: SEQUENCE; Schema: public; Owner: super_admin
--

CREATE SEQUENCE public.branch_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.branch_id_seq OWNER TO super_admin;

--
-- TOC entry 5214 (class 0 OID 0)
-- Dependencies: 234
-- Name: branch_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: super_admin
--

ALTER SEQUENCE public.branch_id_seq OWNED BY public.branch.id;


--
-- TOC entry 225 (class 1259 OID 43020)
-- Name: cache; Type: TABLE; Schema: public; Owner: super_admin
--

CREATE TABLE public.cache (
    key character varying(255) NOT NULL,
    value text NOT NULL,
    expiration integer NOT NULL
);


ALTER TABLE public.cache OWNER TO super_admin;

--
-- TOC entry 226 (class 1259 OID 43030)
-- Name: cache_locks; Type: TABLE; Schema: public; Owner: super_admin
--

CREATE TABLE public.cache_locks (
    key character varying(255) NOT NULL,
    owner character varying(255) NOT NULL,
    expiration integer NOT NULL
);


ALTER TABLE public.cache_locks OWNER TO super_admin;

--
-- TOC entry 245 (class 1259 OID 43160)
-- Name: employee; Type: TABLE; Schema: public; Owner: super_admin
--

CREATE TABLE public.employee (
    id bigint NOT NULL,
    fullname character varying(255) NOT NULL,
    branch_id bigint NOT NULL,
    department_id bigint NOT NULL,
    position_id bigint NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.employee OWNER TO super_admin;

--
-- TOC entry 244 (class 1259 OID 43159)
-- Name: employee_id_seq; Type: SEQUENCE; Schema: public; Owner: super_admin
--

CREATE SEQUENCE public.employee_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.employee_id_seq OWNER TO super_admin;

--
-- TOC entry 5215 (class 0 OID 0)
-- Dependencies: 244
-- Name: employee_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: super_admin
--

ALTER SEQUENCE public.employee_id_seq OWNED BY public.employee.id;


--
-- TOC entry 231 (class 1259 OID 43071)
-- Name: failed_jobs; Type: TABLE; Schema: public; Owner: super_admin
--

CREATE TABLE public.failed_jobs (
    id bigint NOT NULL,
    uuid character varying(255) NOT NULL,
    connection text NOT NULL,
    queue text NOT NULL,
    payload text NOT NULL,
    exception text NOT NULL,
    failed_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.failed_jobs OWNER TO super_admin;

--
-- TOC entry 230 (class 1259 OID 43070)
-- Name: failed_jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: super_admin
--

CREATE SEQUENCE public.failed_jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.failed_jobs_id_seq OWNER TO super_admin;

--
-- TOC entry 5216 (class 0 OID 0)
-- Dependencies: 230
-- Name: failed_jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: super_admin
--

ALTER SEQUENCE public.failed_jobs_id_seq OWNED BY public.failed_jobs.id;


--
-- TOC entry 229 (class 1259 OID 43056)
-- Name: job_batches; Type: TABLE; Schema: public; Owner: super_admin
--

CREATE TABLE public.job_batches (
    id character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    total_jobs integer NOT NULL,
    pending_jobs integer NOT NULL,
    failed_jobs integer NOT NULL,
    failed_job_ids text NOT NULL,
    options text,
    cancelled_at integer,
    created_at integer NOT NULL,
    finished_at integer
);


ALTER TABLE public.job_batches OWNER TO super_admin;

--
-- TOC entry 228 (class 1259 OID 43041)
-- Name: jobs; Type: TABLE; Schema: public; Owner: super_admin
--

CREATE TABLE public.jobs (
    id bigint NOT NULL,
    queue character varying(255) NOT NULL,
    payload text NOT NULL,
    attempts smallint NOT NULL,
    reserved_at integer,
    available_at integer NOT NULL,
    created_at integer NOT NULL
);


ALTER TABLE public.jobs OWNER TO super_admin;

--
-- TOC entry 227 (class 1259 OID 43040)
-- Name: jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: super_admin
--

CREATE SEQUENCE public.jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.jobs_id_seq OWNER TO super_admin;

--
-- TOC entry 5217 (class 0 OID 0)
-- Dependencies: 227
-- Name: jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: super_admin
--

ALTER SEQUENCE public.jobs_id_seq OWNED BY public.jobs.id;


--
-- TOC entry 220 (class 1259 OID 42729)
-- Name: migrations; Type: TABLE; Schema: public; Owner: super_admin
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    migration character varying(255) NOT NULL,
    batch integer NOT NULL
);


ALTER TABLE public.migrations OWNER TO super_admin;

--
-- TOC entry 219 (class 1259 OID 42728)
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: super_admin
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.migrations_id_seq OWNER TO super_admin;

--
-- TOC entry 5218 (class 0 OID 0)
-- Dependencies: 219
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: super_admin
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- TOC entry 223 (class 1259 OID 42999)
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: super_admin
--

CREATE TABLE public.password_reset_tokens (
    email character varying(255) NOT NULL,
    token character varying(255) NOT NULL,
    created_at timestamp(0) without time zone
);


ALTER TABLE public.password_reset_tokens OWNER TO super_admin;

--
-- TOC entry 233 (class 1259 OID 43090)
-- Name: personal_access_tokens; Type: TABLE; Schema: public; Owner: super_admin
--

CREATE TABLE public.personal_access_tokens (
    id bigint NOT NULL,
    tokenable_type character varying(255) NOT NULL,
    tokenable_id bigint NOT NULL,
    name text NOT NULL,
    token character varying(64) NOT NULL,
    abilities text,
    last_used_at timestamp(0) without time zone,
    expires_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.personal_access_tokens OWNER TO super_admin;

--
-- TOC entry 232 (class 1259 OID 43089)
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: super_admin
--

CREATE SEQUENCE public.personal_access_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.personal_access_tokens_id_seq OWNER TO super_admin;

--
-- TOC entry 5219 (class 0 OID 0)
-- Dependencies: 232
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: super_admin
--

ALTER SEQUENCE public.personal_access_tokens_id_seq OWNED BY public.personal_access_tokens.id;


--
-- TOC entry 237 (class 1259 OID 43124)
-- Name: position; Type: TABLE; Schema: public; Owner: super_admin
--

CREATE TABLE public."position" (
    id bigint NOT NULL,
    title character varying(255) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public."position" OWNER TO super_admin;

--
-- TOC entry 236 (class 1259 OID 43123)
-- Name: position_id_seq; Type: SEQUENCE; Schema: public; Owner: super_admin
--

CREATE SEQUENCE public.position_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.position_id_seq OWNER TO super_admin;

--
-- TOC entry 5220 (class 0 OID 0)
-- Dependencies: 236
-- Name: position_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: super_admin
--

ALTER SEQUENCE public.position_id_seq OWNED BY public."position".id;


--
-- TOC entry 255 (class 1259 OID 50479)
-- Name: repair_remarks; Type: TABLE; Schema: public; Owner: super_admin
--

CREATE TABLE public.repair_remarks (
    id bigint NOT NULL,
    repair_id bigint NOT NULL,
    remark text NOT NULL,
    remark_type character varying(255) DEFAULT 'general'::character varying NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.repair_remarks OWNER TO super_admin;

--
-- TOC entry 254 (class 1259 OID 50478)
-- Name: repair_remarks_id_seq; Type: SEQUENCE; Schema: public; Owner: super_admin
--

CREATE SEQUENCE public.repair_remarks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.repair_remarks_id_seq OWNER TO super_admin;

--
-- TOC entry 5221 (class 0 OID 0)
-- Dependencies: 254
-- Name: repair_remarks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: super_admin
--

ALTER SEQUENCE public.repair_remarks_id_seq OWNED BY public.repair_remarks.id;


--
-- TOC entry 251 (class 1259 OID 50295)
-- Name: repairs; Type: TABLE; Schema: public; Owner: super_admin
--

CREATE TABLE public.repairs (
    id bigint NOT NULL,
    asset_id bigint NOT NULL,
    vendor_id bigint NOT NULL,
    description text NOT NULL,
    repair_date date NOT NULL,
    expected_return_date date NOT NULL,
    actual_return_date date,
    repair_cost numeric(10,2),
    status character varying(255) DEFAULT 'Pending'::character varying NOT NULL,
    remarks text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    invoice_no character varying(255),
    completion_description text,
    job_order_path character varying(255),
    delivered_by_employee_id bigint,
    delivered_by_type character varying(255),
    delivered_by_branch_id bigint,
    delivered_by_employee_name character varying(255),
    CONSTRAINT repairs_delivered_by_type_check CHECK (((delivered_by_type)::text = ANY ((ARRAY['employee'::character varying, 'branch'::character varying])::text[]))),
    CONSTRAINT repairs_status_check CHECK (((status)::text = ANY ((ARRAY['Pending'::character varying, 'In Repair'::character varying, 'Completed'::character varying, 'Returned'::character varying])::text[])))
);


ALTER TABLE public.repairs OWNER TO super_admin;

--
-- TOC entry 250 (class 1259 OID 50294)
-- Name: repairs_id_seq; Type: SEQUENCE; Schema: public; Owner: super_admin
--

CREATE SEQUENCE public.repairs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.repairs_id_seq OWNER TO super_admin;

--
-- TOC entry 5222 (class 0 OID 0)
-- Dependencies: 250
-- Name: repairs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: super_admin
--

ALTER SEQUENCE public.repairs_id_seq OWNED BY public.repairs.id;


--
-- TOC entry 239 (class 1259 OID 43133)
-- Name: section; Type: TABLE; Schema: public; Owner: super_admin
--

CREATE TABLE public.section (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.section OWNER TO super_admin;

--
-- TOC entry 238 (class 1259 OID 43132)
-- Name: section_id_seq; Type: SEQUENCE; Schema: public; Owner: super_admin
--

CREATE SEQUENCE public.section_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.section_id_seq OWNER TO super_admin;

--
-- TOC entry 5223 (class 0 OID 0)
-- Dependencies: 238
-- Name: section_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: super_admin
--

ALTER SEQUENCE public.section_id_seq OWNED BY public.section.id;


--
-- TOC entry 224 (class 1259 OID 43008)
-- Name: sessions; Type: TABLE; Schema: public; Owner: super_admin
--

CREATE TABLE public.sessions (
    id character varying(255) NOT NULL,
    user_id bigint,
    ip_address character varying(45),
    user_agent text,
    payload text NOT NULL,
    last_activity integer NOT NULL
);


ALTER TABLE public.sessions OWNER TO super_admin;

--
-- TOC entry 241 (class 1259 OID 43142)
-- Name: status; Type: TABLE; Schema: public; Owner: super_admin
--

CREATE TABLE public.status (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    color character varying(7) DEFAULT '#3B82F6'::character varying NOT NULL
);


ALTER TABLE public.status OWNER TO super_admin;

--
-- TOC entry 5224 (class 0 OID 0)
-- Dependencies: 241
-- Name: COLUMN status.color; Type: COMMENT; Schema: public; Owner: super_admin
--

COMMENT ON COLUMN public.status.color IS 'Hex color code for status badge';


--
-- TOC entry 240 (class 1259 OID 43141)
-- Name: status_id_seq; Type: SEQUENCE; Schema: public; Owner: super_admin
--

CREATE SEQUENCE public.status_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.status_id_seq OWNER TO super_admin;

--
-- TOC entry 5225 (class 0 OID 0)
-- Dependencies: 240
-- Name: status_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: super_admin
--

ALTER SEQUENCE public.status_id_seq OWNED BY public.status.id;


--
-- TOC entry 222 (class 1259 OID 42985)
-- Name: users; Type: TABLE; Schema: public; Owner: super_admin
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    email_verified_at timestamp(0) without time zone,
    password character varying(255) NOT NULL,
    remember_token character varying(100),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    username character varying(255) NOT NULL
);


ALTER TABLE public.users OWNER TO super_admin;

--
-- TOC entry 221 (class 1259 OID 42984)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: super_admin
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO super_admin;

--
-- TOC entry 5226 (class 0 OID 0)
-- Dependencies: 221
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: super_admin
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 247 (class 1259 OID 43205)
-- Name: vendors; Type: TABLE; Schema: public; Owner: super_admin
--

CREATE TABLE public.vendors (
    id bigint NOT NULL,
    company_name character varying(255) NOT NULL,
    contact_no character varying(255) NOT NULL,
    address character varying(255) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.vendors OWNER TO super_admin;

--
-- TOC entry 246 (class 1259 OID 43204)
-- Name: vendors_id_seq; Type: SEQUENCE; Schema: public; Owner: super_admin
--

CREATE SEQUENCE public.vendors_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vendors_id_seq OWNER TO super_admin;

--
-- TOC entry 5227 (class 0 OID 0)
-- Dependencies: 246
-- Name: vendors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: super_admin
--

ALTER SEQUENCE public.vendors_id_seq OWNED BY public.vendors.id;


--
-- TOC entry 4915 (class 2604 OID 43154)
-- Name: asset_category id; Type: DEFAULT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.asset_category ALTER COLUMN id SET DEFAULT nextval('public.asset_category_id_seq'::regclass);


--
-- TOC entry 4921 (class 2604 OID 50397)
-- Name: asset_movements id; Type: DEFAULT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.asset_movements ALTER COLUMN id SET DEFAULT nextval('public.asset_movements_id_seq'::regclass);


--
-- TOC entry 4918 (class 2604 OID 43221)
-- Name: assets id; Type: DEFAULT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.assets ALTER COLUMN id SET DEFAULT nextval('public.assets_id_seq'::regclass);


--
-- TOC entry 4910 (class 2604 OID 43114)
-- Name: branch id; Type: DEFAULT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.branch ALTER COLUMN id SET DEFAULT nextval('public.branch_id_seq'::regclass);


--
-- TOC entry 4916 (class 2604 OID 43163)
-- Name: employee id; Type: DEFAULT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.employee ALTER COLUMN id SET DEFAULT nextval('public.employee_id_seq'::regclass);


--
-- TOC entry 4907 (class 2604 OID 43074)
-- Name: failed_jobs id; Type: DEFAULT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.failed_jobs ALTER COLUMN id SET DEFAULT nextval('public.failed_jobs_id_seq'::regclass);


--
-- TOC entry 4906 (class 2604 OID 43044)
-- Name: jobs id; Type: DEFAULT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.jobs ALTER COLUMN id SET DEFAULT nextval('public.jobs_id_seq'::regclass);


--
-- TOC entry 4904 (class 2604 OID 42732)
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- TOC entry 4909 (class 2604 OID 43093)
-- Name: personal_access_tokens id; Type: DEFAULT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.personal_access_tokens ALTER COLUMN id SET DEFAULT nextval('public.personal_access_tokens_id_seq'::regclass);


--
-- TOC entry 4911 (class 2604 OID 43127)
-- Name: position id; Type: DEFAULT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public."position" ALTER COLUMN id SET DEFAULT nextval('public.position_id_seq'::regclass);


--
-- TOC entry 4922 (class 2604 OID 50482)
-- Name: repair_remarks id; Type: DEFAULT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.repair_remarks ALTER COLUMN id SET DEFAULT nextval('public.repair_remarks_id_seq'::regclass);


--
-- TOC entry 4919 (class 2604 OID 50298)
-- Name: repairs id; Type: DEFAULT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.repairs ALTER COLUMN id SET DEFAULT nextval('public.repairs_id_seq'::regclass);


--
-- TOC entry 4912 (class 2604 OID 43136)
-- Name: section id; Type: DEFAULT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.section ALTER COLUMN id SET DEFAULT nextval('public.section_id_seq'::regclass);


--
-- TOC entry 4913 (class 2604 OID 43145)
-- Name: status id; Type: DEFAULT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.status ALTER COLUMN id SET DEFAULT nextval('public.status_id_seq'::regclass);


--
-- TOC entry 4905 (class 2604 OID 42988)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 4917 (class 2604 OID 43208)
-- Name: vendors id; Type: DEFAULT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.vendors ALTER COLUMN id SET DEFAULT nextval('public.vendors_id_seq'::regclass);


--
-- TOC entry 5191 (class 0 OID 43151)
-- Dependencies: 243
-- Data for Name: asset_category; Type: TABLE DATA; Schema: public; Owner: super_admin
--

COPY public.asset_category (id, name, created_at, updated_at, code) FROM stdin;
1	Monitor	2025-12-12 07:52:12	2025-12-12 07:52:12	M-001
2	Desktop PC	2025-12-12 07:52:24	2025-12-12 07:52:24	DP-001
3	UPS	2025-12-15 03:41:09	2025-12-15 03:41:09	U-001
4	Storage	2025-12-15 03:41:17	2025-12-15 03:41:17	S-001
5	Laptop	2025-12-18 05:14:14	2025-12-18 05:14:14	L-001
6	Printer	2025-12-18 06:22:06	2025-12-18 06:22:06	P-001
7	CCTV	2025-12-19 02:43:01	2025-12-19 02:43:01	C-001
\.


--
-- TOC entry 5201 (class 0 OID 50394)
-- Dependencies: 253
-- Data for Name: asset_movements; Type: TABLE DATA; Schema: public; Owner: super_admin
--

COPY public.asset_movements (id, asset_id, movement_type, from_employee_id, to_employee_id, from_status_id, to_status_id, from_branch_id, to_branch_id, repair_id, performed_by_user_id, reason, remarks, metadata, movement_date, ip_address, user_agent, created_at, updated_at, deleted_at) FROM stdin;
2	1	created	\N	1	\N	1	\N	1	\N	\N	\N	Backfilled movement record for existing asset	{"backfilled": true, "original_created_at": "2025-12-15 02:58:23"}	2025-12-15 02:58:23	\N	\N	2025-12-19 10:16:38	2025-12-19 10:16:38	\N
3	2	created	\N	1	\N	1	\N	1	\N	\N	\N	Backfilled movement record for existing asset	{"backfilled": true, "original_created_at": "2025-12-15 03:37:06"}	2025-12-15 03:37:06	\N	\N	2025-12-19 10:16:38	2025-12-19 10:16:38	\N
4	4	created	\N	1	\N	1	\N	1	\N	\N	\N	Backfilled movement record for existing asset	{"backfilled": true, "original_created_at": "2025-12-16 01:22:57"}	2025-12-16 01:22:57	\N	\N	2025-12-19 10:16:38	2025-12-19 10:16:38	\N
5	5	created	\N	2	\N	2	\N	1	\N	\N	\N	Backfilled movement record for existing asset	{"backfilled": true, "original_created_at": "2025-12-16 02:00:07"}	2025-12-16 02:00:07	\N	\N	2025-12-19 10:16:38	2025-12-19 10:16:38	\N
6	6	created	\N	2	\N	5	\N	1	\N	\N	\N	Backfilled movement record for existing asset	{"backfilled": true, "original_created_at": "2025-12-16 02:07:41"}	2025-12-16 02:07:41	\N	\N	2025-12-19 10:16:38	2025-12-19 10:16:38	\N
7	5	status_changed	\N	\N	2	1	\N	\N	\N	\N	\N	\N	\N	2025-12-19 06:40:06	127.0.0.1	Symfony	2025-12-19 06:40:06	2025-12-19 06:40:06	\N
8	5	status_changed	\N	\N	1	2	\N	\N	\N	1	\N	\N	\N	2025-12-19 06:42:18	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2025-12-19 06:42:18	2025-12-19 06:42:18	\N
9	5	status_changed	\N	\N	2	1	\N	\N	\N	1	\N	\N	\N	2025-12-19 06:42:24	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2025-12-19 06:42:24	2025-12-19 06:42:24	\N
10	6	status_changed	\N	\N	5	2	\N	\N	\N	1	\N	\N	\N	2025-12-19 06:42:36	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2025-12-19 06:42:36	2025-12-19 06:42:36	\N
11	6	status_changed	\N	\N	2	5	\N	\N	\N	1	\N	\N	\N	2025-12-19 06:42:43	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2025-12-19 06:42:43	2025-12-19 06:42:43	\N
12	8	transferred	2	3	\N	\N	1	1	\N	1	\N	\N	\N	2025-12-19 07:28:56	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2025-12-19 07:28:56	2025-12-19 07:28:56	\N
1	8	created	\N	2	\N	2	\N	1	\N	\N	bryan monitor is defective	\N	{"backfilled": true, "original_created_at": "2025-12-18 05:44:22"}	2025-12-18 05:44:22	\N	\N	2025-12-19 10:16:38	2025-12-19 07:28:56	\N
13	8	status_changed	\N	\N	2	5	\N	\N	\N	1	\N	\N	\N	2025-12-19 07:33:24	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2025-12-19 07:33:24	2025-12-19 07:33:24	\N
16	8	status_changed	\N	\N	5	2	\N	\N	\N	1	\N	\N	\N	2025-12-22 02:49:10	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2025-12-22 02:49:10	2025-12-22 02:49:10	\N
18	12	created	\N	3	\N	1	\N	1	\N	1	\N	Asset initially created	\N	2025-12-22 03:35:21	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2025-12-22 03:35:21	2025-12-22 03:35:21	\N
19	8	status_changed	\N	\N	2	3	\N	\N	\N	1	\N	\N	\N	2025-12-22 05:07:35	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2025-12-22 05:07:35	2025-12-22 05:07:35	\N
20	8	status_changed	\N	\N	3	2	\N	\N	\N	1	\N	\N	\N	2025-12-22 05:07:41	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2025-12-22 05:07:41	2025-12-22 05:07:41	\N
21	8	status_changed	\N	\N	2	5	\N	\N	\N	1	\N	\N	\N	2025-12-23 02:04:40	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2025-12-23 02:04:40	2025-12-23 02:04:40	\N
22	8	status_changed	\N	\N	5	2	\N	\N	\N	1	\N	\N	\N	2025-12-23 02:07:19	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2025-12-23 02:07:19	2025-12-23 02:07:19	\N
23	8	status_changed	\N	\N	2	5	\N	\N	\N	1	\N	\N	\N	2025-12-23 02:11:54	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2025-12-23 02:11:54	2025-12-23 02:11:54	\N
24	8	repair_initiated	\N	\N	5	5	\N	\N	1	1	No display LCD defective	Sent to Mastertech for repair	{"expected_return_date":"2025-12-30T00:00:00.000000Z","repair_cost":"15000.00"}	2025-12-23 00:00:00	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2025-12-23 02:16:57	2025-12-23 02:16:57	\N
25	6	status_changed	\N	\N	5	2	\N	\N	\N	1	\N	\N	\N	2025-12-23 03:37:06	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2025-12-23 03:37:06	2025-12-23 03:37:06	\N
51	2	updated	\N	\N	\N	\N	\N	\N	\N	\N	\N	Updated Book Value and Purchase Date	{"changed_fields":[{"field":"book_value","label":"Book Value","type":"currency","old_value":2465.75,"new_value":2448.63},{"field":"purchase_date","label":"Purchase Date","type":"date","old_value":"Dec 19, 2025","new_value":"Dec 14, 2025"}],"change_count":2}	2025-12-29 02:45:56	127.0.0.1	Symfony	2025-12-29 02:45:56	2025-12-29 02:45:56	\N
26	8	repair_completed	\N	\N	5	5	\N	\N	1	1	\N	Returned from Mastertech after repair	{"repair_cost":"15000.00","repair_duration_days":3,"changed_fields":[{"field":"status","label":"Repair Status","type":"text","old_value":"Completed","new_value":"Returned"},{"field":"actual_return_date","label":"Actual Return Date","type":"date","old_value":null,"new_value":"Dec 26, 2025"}],"change_count":2}	2025-12-26 00:00:00	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2025-12-26 01:08:00	2025-12-29 02:46:31	\N
28	6	status_changed	\N	\N	2	5	\N	\N	\N	1	\N	\N	{"changed_fields":[{"field":"status_id","label":"Status","type":"relation","old_value":"Functional","new_value":"Under Repair"}],"change_count":1}	2025-12-26 03:01:31	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2025-12-26 03:01:31	2025-12-26 03:01:31	\N
29	6	status_changed	\N	\N	5	2	\N	\N	\N	1	\N	\N	{"changed_fields":[{"field":"status_id","label":"Status","type":"relation","old_value":"Under Repair","new_value":"Functional"}],"change_count":1}	2025-12-26 03:02:29	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2025-12-26 03:02:29	2025-12-26 03:02:29	\N
30	6	status_changed	\N	\N	2	5	\N	\N	\N	1	\N	\N	{"changed_fields":[{"field":"status_id","label":"Status","type":"relation","old_value":"Functional","new_value":"Under Repair"}],"change_count":1}	2025-12-26 03:02:45	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2025-12-26 03:02:45	2025-12-26 03:02:45	\N
38	6	repair_remark_added	\N	\N	\N	\N	\N	\N	2	\N	Repair remark added (General)	Test remark after migration	{"remark_type":"general","remark_type_label":"General","repair_status":"Pending","vendor_name":"Mastertech","remark_id":8}	2025-12-26 07:01:10	127.0.0.1	Symfony	2025-12-26 07:01:10	2025-12-26 07:01:10	\N
39	6	repair_remark_added	\N	\N	\N	\N	\N	\N	2	1	Repair remark added (General)	test	{"remark_type":"general","remark_type_label":"General","repair_status":"Pending","vendor_name":"Mastertech","remark_id":9}	2025-12-26 07:01:49	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2025-12-26 07:01:49	2025-12-26 07:01:49	\N
40	6	repair_remark_added	\N	\N	\N	\N	\N	\N	2	1	Repair remark added (Pending Reason)	testing	{"remark_type":"pending_reason","remark_type_label":"Pending Reason","repair_status":"Pending","vendor_name":"Mastertech","remark_id":10}	2025-12-26 07:02:00	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2025-12-26 07:02:00	2025-12-26 07:02:00	\N
41	1	updated	\N	\N	\N	\N	\N	\N	\N	\N	\N	Updated Book Value	{"changed_fields":[{"field":"book_value","label":"Book Value","type":"currency","old_value":14958.9,"new_value":14808.22}],"change_count":1}	2025-12-29 01:50:26	127.0.0.1	Symfony	2025-12-29 01:50:26	2025-12-29 01:50:26	\N
42	2	updated	\N	\N	\N	\N	\N	\N	\N	\N	\N	Updated Book Value	{"changed_fields":[{"field":"book_value","label":"Book Value","type":"currency","old_value":2486.3,"new_value":2448.63}],"change_count":1}	2025-12-29 01:50:26	127.0.0.1	Symfony	2025-12-29 01:50:26	2025-12-29 01:50:26	\N
43	4	updated	\N	\N	\N	\N	\N	\N	\N	\N	\N	Updated Book Value	{"changed_fields":[{"field":"book_value","label":"Book Value","type":"currency","old_value":3891.78,"new_value":3846.58}],"change_count":1}	2025-12-29 01:50:26	127.0.0.1	Symfony	2025-12-29 01:50:26	2025-12-29 01:50:26	\N
44	8	updated	\N	\N	\N	\N	\N	\N	\N	\N	\N	Updated Book Value	{"changed_fields":[{"field":"book_value","label":"Book Value","type":"currency","old_value":9281.1,"new_value":9172.6}],"change_count":1}	2025-12-29 01:50:26	127.0.0.1	Symfony	2025-12-29 01:50:26	2025-12-29 01:50:26	\N
45	6	updated	\N	\N	\N	\N	\N	\N	\N	\N	\N	Updated Book Value	{"changed_fields":[{"field":"book_value","label":"Book Value","type":"currency","old_value":1751.6,"new_value":1716.44}],"change_count":1}	2025-12-29 01:50:26	127.0.0.1	Symfony	2025-12-29 01:50:26	2025-12-29 01:50:26	\N
46	12	updated	\N	\N	\N	\N	\N	\N	\N	\N	\N	Updated Book Value	{"changed_fields":[{"field":"book_value","label":"Book Value","type":"currency","old_value":2500,"new_value":2484.02}],"change_count":1}	2025-12-29 01:50:26	127.0.0.1	Symfony	2025-12-29 01:50:26	2025-12-29 01:50:26	\N
47	13	updated	\N	\N	\N	\N	\N	\N	\N	\N	\N	Updated Book Value	{"changed_fields":[{"field":"book_value","label":"Book Value","type":"currency","old_value":249486.3,"new_value":248972.6}],"change_count":1}	2025-12-29 01:50:26	127.0.0.1	Symfony	2025-12-29 01:50:26	2025-12-29 01:50:26	\N
48	2	updated	\N	\N	\N	\N	\N	\N	\N	\N	\N	Updated Book Value and Purchase Date	{"changed_fields":[{"field":"book_value","label":"Book Value","type":"currency","old_value":2448.63,"new_value":2452.05},{"field":"purchase_date","label":"Purchase Date","type":"date","old_value":"Dec 14, 2025","new_value":"Dec 15, 2025"}],"change_count":2}	2025-12-29 02:39:10	127.0.0.1	Symfony	2025-12-29 02:39:10	2025-12-29 02:39:10	\N
49	2	updated	\N	\N	\N	\N	\N	\N	\N	\N	\N	Updated Book Value and Purchase Date	{"changed_fields":[{"field":"book_value","label":"Book Value","type":"currency","old_value":2452.05,"new_value":2448.63},{"field":"purchase_date","label":"Purchase Date","type":"date","old_value":"Dec 15, 2025","new_value":"Dec 14, 2025"}],"change_count":2}	2025-12-29 02:39:10	127.0.0.1	Symfony	2025-12-29 02:39:10	2025-12-29 02:39:10	\N
50	2	updated	\N	\N	\N	\N	\N	\N	\N	\N	\N	Updated Book Value, Purchase Date, and Warranty Expiration	{"changed_fields":[{"field":"book_value","label":"Book Value","type":"currency","old_value":2448.63,"new_value":2465.75},{"field":"purchase_date","label":"Purchase Date","type":"date","old_value":"Dec 14, 2025","new_value":"Dec 19, 2025"},{"field":"waranty_expiration_date","label":"Warranty Expiration","type":"date","old_value":"Dec 15, 2028","new_value":"Dec 29, 2027"}],"change_count":3}	2025-12-29 02:45:56	127.0.0.1	Symfony	2025-12-29 02:45:56	2025-12-29 02:45:56	\N
31	6	repair_initiated	\N	\N	5	5	\N	\N	2	1	No longer charging	Sent to Mastertech for repair	{"expected_return_date":"2026-01-12T00:00:00.000000Z","repair_cost":null,"changed_fields":[{"field":"description","label":"Description","type":"text","old_value":null,"new_value":"No longer charging"},{"field":"expected_return_date","label":"Expected Return Date","type":"date","old_value":null,"new_value":"Jan 12, 2026"},{"field":"repair_cost","label":"Repair Cost","type":"currency","old_value":null,"new_value":null},{"field":"vendor_id","label":"Vendor","type":"relation","old_value":null,"new_value":"Mastertech"}],"change_count":4}	2025-12-26 00:00:00	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2025-12-26 03:03:18	2025-12-29 02:46:31	\N
27	13	created	\N	2	\N	1	\N	1	\N	1	\N	Asset initially created	{"changed_fields":[{"field":"asset_name","label":"Asset Name","type":"text","old_value":null,"new_value":"GPU RTX"},{"field":"serial_number","label":"Serial Number","type":"text","old_value":null,"new_value":"C-001-2025-1766714307036-3P7IBV3A"},{"field":"brand","label":"Brand","type":"text","old_value":null,"new_value":"Nvision"},{"field":"model","label":"Model","type":"text","old_value":null,"new_value":"231313ewqew23232"},{"field":"acq_cost","label":"Acquisition Cost","type":"currency","old_value":null,"new_value":250000},{"field":"purchase_date","label":"Purchase Date","type":"date","old_value":null,"new_value":"Dec 23, 2025"},{"field":"waranty_expiration_date","label":"Warranty Expiration","type":"date","old_value":null,"new_value":"Jul 31, 2026"},{"field":"estimate_life","label":"Estimated Life (Years)","type":"number","old_value":null,"new_value":4},{"field":"asset_category_id","label":"Category","type":"relation","old_value":null,"new_value":"CCTV"},{"field":"vendor_id","label":"Vendor","type":"relation","old_value":null,"new_value":"Mastertech"},{"field":"status_id","label":"Status","type":"relation","old_value":null,"new_value":"New"},{"field":"assigned_to_employee_id","label":"Assigned Employee","type":"relation","old_value":null,"new_value":"Deserie Imy C. Quidet"}],"change_count":12}	2025-12-26 01:58:55	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2025-12-26 01:58:55	2025-12-29 02:46:31	\N
52	6	repair_in_progress	\N	\N	5	5	\N	\N	2	1	Status changed from Pending to In Repair	Repair status changed to Under Repair at Mastertech	{"old_status":"Pending","new_status":"In Repair","repair_cost":null,"vendor_name":"Mastertech","repair_duration_days":null,"changed_fields":[{"field":"status","label":"Repair Status","type":"text","old_value":"Pending","new_value":"In Repair"},{"field":"delivered_by","label":"Delivered By","type":"text","old_value":null,"new_value":"Jasaan Branch"}],"change_count":2}	2025-12-29 02:56:55	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2025-12-29 02:56:55	2025-12-29 02:56:55	\N
53	6	repair_completed	\N	\N	5	5	\N	\N	2	1	Status changed from In Repair to Completed	Repair completed by Mastertech	{"old_status":"In Repair","new_status":"Completed","repair_cost":"1200.00","vendor_name":"Mastertech","repair_duration_days":null,"changed_fields":[{"field":"status","label":"Repair Status","type":"text","old_value":"In Repair","new_value":"Completed"},{"field":"repair_cost","label":"Repair Cost","type":"currency","old_value":null,"new_value":"1200.00"}],"change_count":2}	2025-12-29 03:26:52	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2025-12-29 03:26:52	2025-12-29 03:26:52	\N
54	6	repair_updated	\N	\N	\N	\N	\N	\N	2	1	Repair record updated	Updated repair record fields: Repair Cost	{"changed_fields":[{"field":"repair_cost","label":"Repair Cost","type":"currency","old_value":null,"new_value":"1200.00"}],"change_count":1,"repair_status":"Completed","vendor_name":"Mastertech"}	2025-12-29 03:26:52	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2025-12-29 03:26:52	2025-12-29 03:26:52	\N
55	5	status_changed	\N	\N	1	5	\N	\N	\N	1	\N	\N	{"changed_fields":[{"field":"status_id","label":"Status","type":"relation","old_value":"New","new_value":"Under Repair"}],"change_count":1}	2025-12-29 07:51:47	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2025-12-29 07:51:47	2025-12-29 07:51:47	\N
56	5	status_changed	\N	\N	5	2	\N	\N	\N	1	\N	\N	{"changed_fields":[{"field":"status_id","label":"Status","type":"relation","old_value":"Under Repair","new_value":"Functional"}],"change_count":1}	2025-12-29 08:09:26	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2025-12-29 08:09:26	2025-12-29 08:09:26	\N
62	13	updated	\N	\N	\N	\N	\N	\N	\N	1	\N	Updated Category	{"changed_fields":[{"field":"asset_category_id","label":"Category","type":"relation","old_value":"CCTV","new_value":"Desktop PC"}],"change_count":1}	2026-01-07 01:20:21	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-07 01:20:21	2026-01-07 01:20:21	\N
63	13	updated	\N	\N	\N	\N	\N	\N	\N	1	\N	Updated Category	{"changed_fields":[{"field":"asset_category_id","label":"Category","type":"relation","old_value":"Desktop PC","new_value":"CCTV"}],"change_count":1}	2026-01-07 01:20:30	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-07 01:20:30	2026-01-07 01:20:30	\N
\.


--
-- TOC entry 5197 (class 0 OID 43218)
-- Dependencies: 249
-- Data for Name: assets; Type: TABLE DATA; Schema: public; Owner: super_admin
--

COPY public.assets (id, asset_name, asset_category_id, brand, model, book_value, serial_number, purchase_date, acq_cost, waranty_expiration_date, estimate_life, vendor_id, status_id, remarks, assigned_to_employee_id, created_at, updated_at, qr_code, barcode) FROM stdin;
2	UPS	3	APC	52245454	2448.63	452245544	2025-12-14	2500	2027-12-29	2	1	1	\N	1	2025-12-15 03:37:06	2025-12-29 02:45:56	data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZlcnNpb249IjEuMSIgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIHZpZXdCb3g9IjAgMCAzMDAgMzAwIj48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2ZmZmZmZiIvPjxnIHRyYW5zZm9ybT0ic2NhbGUoNS4yNjMpIj48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgwLDApIj48cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik05IDBMOSAxTDggMUw4IDJMOSAyTDkgNEwxMSA0TDExIDVMMTAgNUwxMCA3TDExIDdMMTEgNUwxNCA1TDE0IDdMMTMgN0wxMyA2TDEyIDZMMTIgOEwxMCA4TDEwIDlMMTIgOUwxMiA4TDE0IDhMMTQgOUwxNSA5TDE1IDEwTDE4IDEwTDE4IDExTDE3IDExTDE3IDEyTDE2IDEyTDE2IDExTDE1IDExTDE1IDEzTDE0IDEzTDE0IDE0TDEwIDE0TDEwIDE1TDggMTVMOCAxNEw2IDE0TDYgMTVMNSAxNUw1IDEzTDcgMTNMNyAxMkw2IDEyTDYgMTFMNyAxMUw3IDEwTDYgMTBMNiA5TDggOUw4IDEwTDkgMTBMOSA5TDggOUw4IDhMOSA4TDkgNUw4IDVMOCA4TDQgOEw0IDlMMyA5TDMgMTBMMiAxMEwyIDExTDMgMTFMMyAxMEw0IDEwTDQgOUw1IDlMNSAxM0w0IDEzTDQgMTVMNSAxNUw1IDE2TDMgMTZMMyAxNUwyIDE1TDIgMTZMMSAxNkwxIDEzTDIgMTNMMiAxNEwzIDE0TDMgMTJMMCAxMkwwIDE2TDEgMTZMMSAxOEwyIDE4TDIgMTlMMSAxOUwxIDIwTDAgMjBMMCAyMUwxIDIxTDEgMjBMMiAyMEwyIDE5TDQgMTlMNCAyMEwzIDIwTDMgMjFMMiAyMUwyIDIyTDEgMjJMMSAyM0w1IDIzTDUgMjJMNiAyMkw2IDIzTDcgMjNMNyAyNEw2IDI0TDYgMjVMNSAyNUw1IDI0TDMgMjRMMyAyNUw1IDI1TDUgMjZMNCAyNkw0IDI4TDMgMjhMMyAyN0wyIDI3TDIgMjZMMSAyNkwxIDI3TDAgMjdMMCAyOEwxIDI4TDEgMjlMMCAyOUwwIDMwTDIgMzBMMiAyOUw0IDI5TDQgMzBMMyAzMEwzIDMxTDIgMzFMMiAzMkwxIDMyTDEgMzFMMCAzMUwwIDM1TDEgMzVMMSAzM0wyIDMzTDIgMzJMMyAzMkwzIDM0TDIgMzRMMiAzNUwzIDM1TDMgMzRMNCAzNEw0IDM1TDcgMzVMNyAzNkw1IDM2TDUgMzdMNCAzN0w0IDM2TDAgMzZMMCAzN0wxIDM3TDEgMzhMMCAzOEwwIDQxTDEgNDFMMSA0MEwyIDQwTDIgMzlMMSAzOUwxIDM4TDIgMzhMMiAzN0wzIDM3TDMgMzhMNSAzOEw1IDM5TDMgMzlMMyA0M0wwIDQzTDAgNDRMNCA0NEw0IDQ2TDUgNDZMNSA0N0wzIDQ3TDMgNDVMMiA0NUwyIDQ3TDEgNDdMMSA0NUwwIDQ1TDAgNDhMNSA0OEw1IDQ3TDggNDdMOCA0OEw2IDQ4TDYgNDlMOCA0OUw4IDUzTDkgNTNMOSA1NUwxMiA1NUwxMiA1N0wxMyA1N0wxMyA1NUwxNCA1NUwxNCA1NkwxNSA1NkwxNSA1N0wxNyA1N0wxNyA1NkwxOCA1NkwxOCA1NUwxOSA1NUwxOSA1NEwxNiA1NEwxNiA1M0wxNSA1M0wxNSA1MkwxNiA1MkwxNiA1MUwxNyA1MUwxNyA1M0wxOSA1M0wxOSA1MEwyMCA1MEwyMCA0OUwyMSA0OUwyMSA1MUwyMyA1MUwyMyA1MEwyNCA1MEwyNCA1MkwyMSA1MkwyMSA1M0wyMyA1M0wyMyA1NEwyMiA1NEwyMiA1NkwyMSA1NkwyMSA1N0wyMiA1N0wyMiA1NkwyMyA1NkwyMyA1NUwyNCA1NUwyNCA1NkwyNSA1NkwyNSA1N0wyNiA1N0wyNiA1NkwyNyA1NkwyNyA1N0wzMiA1N0wzMiA1NkwzMSA1NkwzMSA1NEwzMCA1NEwzMCA1NkwyOCA1NkwyOCA1NUwyOSA1NUwyOSA1NEwyOCA1NEwyOCA1M0wzMiA1M0wzMiA1NEwzMyA1NEwzMyA1NkwzNCA1NkwzNCA1N0wzNSA1N0wzNSA1NkwzNiA1NkwzNiA1N0wzNyA1N0wzNyA1NEwzOCA1NEwzOCA1NkwzOSA1NkwzOSA1NUw0MCA1NUw0MCA1Nkw0MSA1Nkw0MSA1N0w0NiA1N0w0NiA1Nkw0OCA1Nkw0OCA1N0w1MCA1N0w1MCA1NEw1MSA1NEw1MSA1NUw1NCA1NUw1NCA1N0w1NSA1N0w1NSA1NEw1NyA1NEw1NyA1Mkw1NiA1Mkw1NiA1MEw1NSA1MEw1NSA0OUw1NyA0OUw1NyA0N0w1NiA0N0w1NiA0Nkw1NSA0Nkw1NSA0NUw1NiA0NUw1NiA0NEw1NyA0NEw1NyA0M0w1NiA0M0w1NiA0NEw1NSA0NEw1NSA0NUw1NCA0NUw1NCA0Nkw1MyA0Nkw1MyA0N0w1NiA0N0w1NiA0OEw1NSA0OEw1NSA0OUw1MyA0OUw1MyA0OEw1MSA0OEw1MSA0N0w1MiA0N0w1MiA0NUw1MyA0NUw1MyA0M0w1MiA0M0w1MiA0MUw1MyA0MUw1MyA0Mkw1NiA0Mkw1NiA0MUw1NyA0MUw1NyA0MEw1NiA0MEw1NiAzOEw1NSAzOEw1NSAzN0w1NyAzN0w1NyAzNUw1NiAzNUw1NiAzM0w1MyAzM0w1MyAzMEw1NCAzMEw1NCAzMUw1NSAzMUw1NSAzMkw1NiAzMkw1NiAyOUw1NyAyOUw1NyAyN0w1NiAyN0w1NiAyNkw1NSAyNkw1NSAyN0w1NiAyN0w1NiAyOEw1NSAyOEw1NSAzMEw1NCAzMEw1NCAyOEw1MyAyOEw1MyAyNkw1MiAyNkw1MiAyM0w1MyAyM0w1MyAyNEw1NCAyNEw1NCAyNUw1NyAyNUw1NyAyNEw1NCAyNEw1NCAyM0w1MyAyM0w1MyAyMkw1NCAyMkw1NCAyMUw1MyAyMUw1MyAyMkw1MiAyMkw1MiAxOUw1MyAxOUw1MyAxOEw1NCAxOEw1NCAxOUw1NiAxOUw1NiAxOEw1NyAxOEw1NyAxNUw1NiAxNUw1NiAxM0w1NyAxM0w1NyAxMUw1NiAxMUw1NiAxMkw1NSAxMkw1NSAxM0w1NCAxM0w1NCAxNEw1MyAxNEw1MyAxM0w1MiAxM0w1MiAxMUw1NCAxMUw1NCAxMEw1NSAxMEw1NSA5TDU2IDlMNTYgOEw1NSA4TDU1IDlMNTMgOUw1MyAxMEw1MiAxMEw1MiA4TDUwIDhMNTAgMTVMNTIgMTVMNTIgMTZMNTMgMTZMNTMgMThMNTIgMThMNTIgMTdMNTAgMTdMNTAgMTZMNDkgMTZMNDkgMTVMNDUgMTVMNDUgMTZMNDQgMTZMNDQgMTVMNDMgMTVMNDMgMTZMNDIgMTZMNDIgMTVMNDEgMTVMNDEgMTRMNDQgMTRMNDQgMTNMNDUgMTNMNDUgMTJMNDYgMTJMNDYgMTNMNDcgMTNMNDcgMTJMNDggMTJMNDggMTFMNDkgMTFMNDkgOUw0OCA5TDQ4IDhMNDkgOEw0OSA2TDQ4IDZMNDggN0w0NyA3TDQ3IDVMNDggNUw0OCAwTDQ0IDBMNDQgM0w0NSAzTDQ1IDRMNDEgNEw0MSAzTDQwIDNMNDAgMkw0MiAyTDQyIDNMNDMgM0w0MyAwTDQxIDBMNDEgMUwzOSAxTDM5IDBMMzcgMEwzNyAxTDM2IDFMMzYgMkwzNCAyTDM0IDRMMzMgNEwzMyAzTDMyIDNMMzIgNUwzMSA1TDMxIDRMMjcgNEwyNyAzTDI0IDNMMjQgMUwyNiAxTDI2IDJMMjggMkwyOCAxTDI3IDFMMjcgMEwyNCAwTDI0IDFMMjIgMUwyMiAwTDE5IDBMMTkgMUwxNyAxTDE3IDJMMTggMkwxOCAzTDE2IDNMMTYgMUwxNSAxTDE1IDJMMTQgMkwxNCAwTDEyIDBMMTIgMUwxMSAxTDExIDJMOSAyTDkgMUwxMCAxTDEwIDBaTTMzIDBMMzMgMUwzNCAxTDM0IDBaTTEyIDFMMTIgMkwxMSAyTDExIDNMMTIgM0wxMiA0TDE0IDRMMTQgNUwxNSA1TDE1IDhMMTcgOEwxNyA5TDE4IDlMMTggMTBMMTkgMTBMMTkgOUwxOCA5TDE4IDhMMTcgOEwxNyA3TDE4IDdMMTggNUwxOSA1TDE5IDhMMjAgOEwyMCAxMUwyMSAxMUwyMSAxMEwyMiAxMEwyMiA2TDIzIDZMMjMgMTFMMjIgMTFMMjIgMTJMMjEgMTJMMjEgMTNMMjQgMTNMMjQgMTJMMjUgMTJMMjUgMTRMMjMgMTRMMjMgMTZMMjQgMTZMMjQgMTdMMjIgMTdMMjIgMTZMMjAgMTZMMjAgMTVMMTkgMTVMMTkgMTZMMTggMTZMMTggMTRMMjAgMTRMMjAgMTNMMTggMTNMMTggMTRMMTcgMTRMMTcgMTVMMTYgMTVMMTYgMTNMMTUgMTNMMTUgMTRMMTQgMTRMMTQgMTZMMTMgMTZMMTMgMTVMMTIgMTVMMTIgMTZMMTMgMTZMMTMgMTdMMTYgMTdMMTYgMThMMTIgMThMMTIgMTlMMTEgMTlMMTEgMTdMMTAgMTdMMTAgMTlMOSAxOUw5IDIyTDggMjJMOCAyM0w5IDIzTDkgMjJMMTAgMjJMMTAgMjRMOSAyNEw5IDI1TDEwIDI1TDEwIDI0TDEyIDI0TDEyIDI1TDExIDI1TDExIDI3TDkgMjdMOSAyOEwxMSAyOEwxMSAzMEwxMCAzMEwxMCAyOUw5IDI5TDkgMzFMMTMgMzFMMTMgMzJMMTIgMzJMMTIgMzNMMTEgMzNMMTEgMzJMOCAzMkw4IDMzTDYgMzNMNiAzMkw3IDMyTDcgMzFMNSAzMUw1IDMyTDQgMzJMNCAzM0w1IDMzTDUgMzRMNyAzNEw3IDM1TDggMzVMOCAzN0w1IDM3TDUgMzhMNyAzOEw3IDM5TDYgMzlMNiA0MEw3IDQwTDcgNDFMNSA0MUw1IDQwTDQgNDBMNCA0Mkw1IDQyTDUgNDNMNiA0M0w2IDQ0TDUgNDRMNSA0NUw2IDQ1TDYgNDZMOCA0Nkw4IDQ3TDkgNDdMOSA0OEwxMCA0OEwxMCA0NkwxMyA0NkwxMyA0NEwxNCA0NEwxNCA0NkwxNSA0NkwxNSA0NEwxNCA0NEwxNCA0MkwxNSA0MkwxNSA0MUwxNiA0MUwxNiA0MEwxNSA0MEwxNSA0MUwxNCA0MUwxNCA0MEwxMyA0MEwxMyA0MUwxMiA0MUwxMiAzOUwxNiAzOUwxNiAzN0wxOCAzN0wxOCAzNEwxNyAzNEwxNyAzMkwyMSAzMkwyMSAzM0wyMyAzM0wyMyAzMkwyNCAzMkwyNCAzNEwxOSAzNEwxOSAzNkwyMCAzNkwyMCAzNUwyMSAzNUwyMSAzNkwyMiAzNkwyMiAzOEwyMCAzOEwyMCAzN0wxOSAzN0wxOSAzOEwyMCAzOEwyMCA0MEwxOSA0MEwxOSAzOUwxOCAzOUwxOCAzOEwxNyAzOEwxNyA0MUwyMCA0MUwyMCA0MkwxOSA0MkwxOSA0M0wxOCA0M0wxOCA0MkwxNyA0MkwxNyA0NEwxNiA0NEwxNiA0NUwxNyA0NUwxNyA0N0wxNCA0N0wxNCA1MEwxMyA1MEwxMyA0OEwxMiA0OEwxMiA0N0wxMSA0N0wxMSA0OEwxMiA0OEwxMiA0OUwxMSA0OUwxMSA1MkwxMCA1MkwxMCA0OUw5IDQ5TDkgNTNMMTAgNTNMMTAgNTRMMTIgNTRMMTIgNTVMMTMgNTVMMTMgNTRMMTQgNTRMMTQgNTVMMTUgNTVMMTUgNTNMMTMgNTNMMTMgNTRMMTIgNTRMMTIgNTNMMTEgNTNMMTEgNTJMMTQgNTJMMTQgNTBMMTUgNTBMMTUgNTFMMTYgNTFMMTYgNTBMMTUgNTBMMTUgNDlMMTcgNDlMMTcgNTBMMTggNTBMMTggNDdMMTkgNDdMMTkgNDlMMjAgNDlMMjAgNDdMMjEgNDdMMjEgNDlMMjIgNDlMMjIgNTBMMjMgNTBMMjMgNDlMMjIgNDlMMjIgNDhMMjUgNDhMMjUgNDlMMjQgNDlMMjQgNTBMMjUgNTBMMjUgNTJMMjYgNTJMMjYgNTBMMjUgNTBMMjUgNDlMMjYgNDlMMjYgNDdMMjUgNDdMMjUgNDVMMjYgNDVMMjYgNDZMMjggNDZMMjggNDVMMjYgNDVMMjYgNDRMMjggNDRMMjggNDNMMjkgNDNMMjkgNDZMMzAgNDZMMzAgNDdMMjkgNDdMMjkgNDhMMzAgNDhMMzAgNDdMMzIgNDdMMzIgNDVMMzMgNDVMMzMgNDRMMzQgNDRMMzQgNDZMMzMgNDZMMzMgNDdMMzUgNDdMMzUgNDRMMzYgNDRMMzYgNDJMMzUgNDJMMzUgNDBMMzQgNDBMMzQgNDFMMzMgNDFMMzMgNDJMMzEgNDJMMzEgNDFMMzIgNDFMMzIgNDBMMzMgNDBMMzMgMzlMMzYgMzlMMzYgNDBMMzcgNDBMMzcgMzlMMzYgMzlMMzYgMzdMMzggMzdMMzggMzZMMzkgMzZMMzkgMzdMNDMgMzdMNDMgMzZMNDQgMzZMNDQgMzVMNDUgMzVMNDUgMzRMNDYgMzRMNDYgMzVMNDcgMzVMNDcgMzRMNDkgMzRMNDkgMzVMNDggMzVMNDggMzZMNDcgMzZMNDcgMzdMNDYgMzdMNDYgMzZMNDUgMzZMNDUgMzdMNDQgMzdMNDQgMzhMNDMgMzhMNDMgMzlMNDIgMzlMNDIgNDBMNDEgNDBMNDEgMzlMNDAgMzlMNDAgNDBMMzggNDBMMzggNDFMMzcgNDFMMzcgNDNMMzggNDNMMzggNDRMNDAgNDRMNDAgNDZMMzkgNDZMMzkgNDdMMzggNDdMMzggNDZMMzYgNDZMMzYgNDdMMzcgNDdMMzcgNDhMMzUgNDhMMzUgNDlMMzYgNDlMMzYgNTFMMzcgNTFMMzcgNDlMMzggNDlMMzggNDhMMzkgNDhMMzkgNDlMNDEgNDlMNDEgNTBMNDIgNTBMNDIgNDlMNDQgNDlMNDQgNTBMNDMgNTBMNDMgNTFMMzkgNTFMMzkgNTBMMzggNTBMMzggNTJMMzUgNTJMMzUgNTBMMzIgNTBMMzIgNTFMMzEgNTFMMzEgNTJMMzIgNTJMMzIgNTFMMzMgNTFMMzMgNTJMMzUgNTJMMzUgNTRMMzYgNTRMMzYgNTNMMzggNTNMMzggNTJMNDAgNTJMNDAgNTRMNDEgNTRMNDEgNTVMNDIgNTVMNDIgNTZMNDMgNTZMNDMgNTVMNDQgNTVMNDQgNTRMNDUgNTRMNDUgNTZMNDYgNTZMNDYgNTVMNDcgNTVMNDcgNTNMNDggNTNMNDggNTVMNDkgNTVMNDkgNTNMNDggNTNMNDggNTJMNDcgNTJMNDcgNTFMNDggNTFMNDggNDdMNDcgNDdMNDcgNDZMNTAgNDZMNTAgNDdMNDkgNDdMNDkgNDhMNTAgNDhMNTAgNDdMNTEgNDdMNTEgNDZMNTAgNDZMNTAgNDVMNTIgNDVMNTIgNDRMNTAgNDRMNTAgNDNMNTEgNDNMNTEgNDJMNTAgNDJMNTAgNDFMNTIgNDFMNTIgMzhMNTMgMzhMNTMgMzdMNTEgMzdMNTEgMzZMNTIgMzZMNTIgMzVMNTMgMzVMNTMgMzZMNTQgMzZMNTQgMzdMNTUgMzdMNTUgMzZMNTYgMzZMNTYgMzVMNTUgMzVMNTUgMzRMNTMgMzRMNTMgMzNMNTIgMzNMNTIgMzJMNTAgMzJMNTAgMzFMNDcgMzFMNDcgMzBMNDggMzBMNDggMjlMNDYgMjlMNDYgMjhMNDUgMjhMNDUgMzBMNDQgMzBMNDQgMjdMNDggMjdMNDggMjVMNDkgMjVMNDkgMjZMNTAgMjZMNTAgMjVMNTEgMjVMNTEgMjRMNTAgMjRMNTAgMjVMNDkgMjVMNDkgMjRMNDggMjRMNDggMjNMNDkgMjNMNDkgMjJMNTAgMjJMNTAgMjFMNTEgMjFMNTEgMjBMNDkgMjBMNDkgMThMNDggMThMNDggMTdMNDkgMTdMNDkgMTZMNDggMTZMNDggMTdMNDYgMTdMNDYgMTZMNDUgMTZMNDUgMThMNDQgMThMNDQgMTZMNDMgMTZMNDMgMThMNDIgMThMNDIgMjBMNDEgMjBMNDEgMTlMMzggMTlMMzggMThMMzYgMThMMzYgMTdMMzUgMTdMMzUgMTZMMzQgMTZMMzQgMTlMMzcgMTlMMzcgMjBMMzYgMjBMMzYgMjFMMzUgMjFMMzUgMjBMMzQgMjBMMzQgMjFMMzMgMjFMMzMgMjBMMzIgMjBMMzIgMTlMMzMgMTlMMzMgMThMMzIgMThMMzIgMTlMMzEgMTlMMzEgMThMMzAgMThMMzAgMTlMMjkgMTlMMjkgMjBMMjggMjBMMjggMTdMMzAgMTdMMzAgMTZMMjggMTZMMjggMTNMMjkgMTNMMjkgMTVMMzEgMTVMMzEgMTdMMzMgMTdMMzMgMTRMMzIgMTRMMzIgMTNMMjkgMTNMMjkgMTJMMzAgMTJMMzAgMTFMMjkgMTFMMjkgMTJMMjggMTJMMjggMTBMMjkgMTBMMjkgOUwyNyA5TDI3IDEwTDI2IDEwTDI2IDlMMjUgOUwyNSA3TDI2IDdMMjYgNEwyNSA0TDI1IDdMMjQgN0wyNCA2TDIzIDZMMjMgNUwyMSA1TDIxIDRMMjAgNEwyMCAzTDE4IDNMMTggNUwxNyA1TDE3IDRMMTQgNEwxNCAzTDEzIDNMMTMgMVpNMTkgMUwxOSAyTDIwIDJMMjAgMVpNMjEgMUwyMSAzTDIyIDNMMjIgMVpNMzAgMUwzMCAzTDMxIDNMMzEgMkwzMiAyTDMyIDFaTTM4IDFMMzggM0wzNyAzTDM3IDJMMzYgMkwzNiAzTDM3IDNMMzcgNEwzOSA0TDM5IDVMMzYgNUwzNiA0TDM1IDRMMzUgNUwzMiA1TDMyIDZMMzEgNkwzMSA3TDMyIDdMMzIgOUwzMSA5TDMxIDEwTDMyIDEwTDMyIDExTDMxIDExTDMxIDEyTDMyIDEyTDMyIDExTDMzIDExTDMzIDlMMzQgOUwzNCA4TDM1IDhMMzUgOUwzNiA5TDM2IDExTDM1IDExTDM1IDEwTDM0IDEwTDM0IDE1TDM1IDE1TDM1IDE0TDM2IDE0TDM2IDE2TDM3IDE2TDM3IDE1TDM4IDE1TDM4IDEzTDM5IDEzTDM5IDE0TDQwIDE0TDQwIDEzTDQxIDEzTDQxIDEyTDQzIDEyTDQzIDExTDQ1IDExTDQ1IDEwTDQ0IDEwTDQ0IDlMNDMgOUw0MyAxMUw0MCAxMUw0MCAxMkwzOSAxMkwzOSAxMEw0MCAxMEw0MCA5TDQxIDlMNDEgMTBMNDIgMTBMNDIgOEw0MyA4TDQzIDdMNDQgN0w0NCA4TDQ1IDhMNDUgOUw0NiA5TDQ2IDhMNDcgOEw0NyA3TDQ2IDdMNDYgNUw0NyA1TDQ3IDNMNDYgM0w0NiA1TDQwIDVMNDAgNEwzOSA0TDM5IDFaTTQ1IDFMNDUgMkw0NyAyTDQ3IDFaTTE5IDRMMTkgNUwyMCA1TDIwIDdMMjEgN0wyMSA1TDIwIDVMMjAgNFpNMTYgNUwxNiA3TDE3IDdMMTcgNVpNMjcgNUwyNyA4TDMwIDhMMzAgNVpNMjggNkwyOCA3TDI5IDdMMjkgNlpNMzIgNkwzMiA3TDMzIDdMMzMgOEwzNCA4TDM0IDdMMzUgN0wzNSA4TDM3IDhMMzcgNkwzNiA2TDM2IDdMMzUgN0wzNSA2TDM0IDZMMzQgN0wzMyA3TDMzIDZaTTM4IDZMMzggN0wzOSA3TDM5IDhMMzggOEwzOCA5TDM3IDlMMzcgMTFMMzYgMTFMMzYgMTJMMzUgMTJMMzUgMTNMMzYgMTNMMzYgMTJMMzcgMTJMMzcgMTFMMzggMTFMMzggMTBMMzkgMTBMMzkgOUw0MCA5TDQwIDdMNDEgN0w0MSA2TDQwIDZMNDAgN0wzOSA3TDM5IDZaTTQyIDZMNDIgN0w0MyA3TDQzIDZaTTQ0IDZMNDQgN0w0NSA3TDQ1IDZaTTAgOUwwIDEwTDEgMTBMMSA5Wk00NyA5TDQ3IDEwTDQ4IDEwTDQ4IDlaTTEwIDEwTDEwIDEyTDkgMTJMOSAxM0wxMCAxM0wxMCAxMkwxMSAxMkwxMSAxM0wxMyAxM0wxMyAxMkwxMiAxMkwxMiAxMUwxNCAxMUwxNCAxMFpNMjUgMTBMMjUgMTJMMjYgMTJMMjYgMTBaTTQ4IDEzTDQ4IDE0TDQ5IDE0TDQ5IDEzWk01MSAxM0w1MSAxNEw1MiAxNEw1MiAxM1pNMjEgMTRMMjEgMTVMMjIgMTVMMjIgMTRaTTI1IDE0TDI1IDE3TDI0IDE3TDI0IDE4TDIzIDE4TDIzIDE5TDI2IDE5TDI2IDIwTDI3IDIwTDI3IDIxTDI4IDIxTDI4IDIyTDI1IDIyTDI1IDIwTDI0IDIwTDI0IDIxTDIzIDIxTDIzIDIyTDI1IDIyTDI1IDI1TDI0IDI1TDI0IDIzTDIzIDIzTDIzIDI1TDIyIDI1TDIyIDI0TDIxIDI0TDIxIDIyTDIyIDIyTDIyIDIwTDIwIDIwTDIwIDE5TDIyIDE5TDIyIDE3TDIwIDE3TDIwIDE2TDE5IDE2TDE5IDE3TDE4IDE3TDE4IDE4TDE3IDE4TDE3IDE5TDE4IDE5TDE4IDE4TDE5IDE4TDE5IDIyTDIwIDIyTDIwIDI0TDE5IDI0TDE5IDI1TDE3IDI1TDE3IDI2TDE2IDI2TDE2IDI1TDE0IDI1TDE0IDI0TDEzIDI0TDEzIDI1TDEyIDI1TDEyIDI3TDEzIDI3TDEzIDI4TDEyIDI4TDEyIDI5TDEzIDI5TDEzIDMwTDE0IDMwTDE0IDI5TDEzIDI5TDEzIDI4TDE0IDI4TDE0IDI2TDE2IDI2TDE2IDI5TDE4IDI5TDE4IDI4TDI0IDI4TDI0IDI3TDI2IDI3TDI2IDI4TDI1IDI4TDI1IDI5TDI2IDI5TDI2IDMxTDI3IDMxTDI3IDMyTDI2IDMyTDI2IDMzTDI1IDMzTDI1IDM1TDI2IDM1TDI2IDM0TDI3IDM0TDI3IDMzTDI4IDMzTDI4IDM0TDI5IDM0TDI5IDMzTDMwIDMzTDMwIDM1TDI5IDM1TDI5IDM2TDI4IDM2TDI4IDM3TDI5IDM3TDI5IDM4TDMwIDM4TDMwIDM3TDI5IDM3TDI5IDM2TDMyIDM2TDMyIDM3TDMxIDM3TDMxIDM4TDMyIDM4TDMyIDM5TDMzIDM5TDMzIDM4TDM1IDM4TDM1IDM3TDMzIDM3TDMzIDM1TDM0IDM1TDM0IDM0TDMxIDM0TDMxIDMzTDMzIDMzTDMzIDMyTDMxIDMyTDMxIDMwTDMyIDMwTDMyIDMxTDMzIDMxTDMzIDMwTDMyIDMwTDMyIDI1TDMzIDI1TDMzIDI3TDM0IDI3TDM0IDI1TDM1IDI1TDM1IDI0TDM2IDI0TDM2IDI1TDM3IDI1TDM3IDIzTDM5IDIzTDM5IDI1TDM4IDI1TDM4IDI3TDM3IDI3TDM3IDI5TDM2IDI5TDM2IDI3TDM1IDI3TDM1IDMwTDM0IDMwTDM0IDMxTDM3IDMxTDM3IDMwTDM4IDMwTDM4IDMxTDM5IDMxTDM5IDMyTDQwIDMyTDQwIDMxTDQxIDMxTDQxIDMyTDQyIDMyTDQyIDMzTDQwIDMzTDQwIDM0TDM5IDM0TDM5IDMzTDM4IDMzTDM4IDMyTDM1IDMyTDM1IDM1TDM2IDM1TDM2IDM2TDM4IDM2TDM4IDM1TDM5IDM1TDM5IDM2TDQwIDM2TDQwIDM1TDQxIDM1TDQxIDM2TDQyIDM2TDQyIDM1TDQxIDM1TDQxIDM0TDQ0IDM0TDQ0IDMzTDQ1IDMzTDQ1IDMyTDQ2IDMyTDQ2IDMzTDQ3IDMzTDQ3IDMyTDQ2IDMyTDQ2IDMxTDQ1IDMxTDQ1IDMyTDQ0IDMyTDQ0IDMwTDQzIDMwTDQzIDI5TDQxIDI5TDQxIDMwTDQwIDMwTDQwIDI5TDM5IDI5TDM5IDI1TDQwIDI1TDQwIDI2TDQxIDI2TDQxIDI4TDQyIDI4TDQyIDI1TDQxIDI1TDQxIDIxTDQwIDIxTDQwIDIwTDM5IDIwTDM5IDIxTDM4IDIxTDM4IDIwTDM3IDIwTDM3IDIzTDM1IDIzTDM1IDIxTDM0IDIxTDM0IDIyTDMzIDIyTDMzIDIxTDMyIDIxTDMyIDIyTDMzIDIyTDMzIDIzTDMxIDIzTDMxIDE5TDMwIDE5TDMwIDIwTDI5IDIwTDI5IDIxTDI4IDIxTDI4IDIwTDI3IDIwTDI3IDE5TDI2IDE5TDI2IDE4TDI3IDE4TDI3IDE2TDI2IDE2TDI2IDE1TDI3IDE1TDI3IDE0Wk02IDE1TDYgMTZMNyAxNkw3IDE1Wk0xMCAxNUwxMCAxNkwxMSAxNkwxMSAxNVpNNDAgMTVMNDAgMTZMMzkgMTZMMzkgMThMNDAgMThMNDAgMTdMNDIgMTdMNDIgMTZMNDEgMTZMNDEgMTVaTTUzIDE1TDUzIDE2TDU0IDE2TDU0IDE4TDU2IDE4TDU2IDE3TDU1IDE3TDU1IDE1Wk04IDE2TDggMTdMOSAxN0w5IDE2Wk0xNiAxNkwxNiAxN0wxNyAxN0wxNyAxNlpNNCAxN0w0IDE4TDUgMThMNSAyMUw2IDIxTDYgMjJMNyAyMkw3IDIxTDggMjFMOCAyMEw3IDIwTDcgMTlMOCAxOUw4IDE4TDcgMThMNyAxN1pNMTkgMTdMMTkgMThMMjAgMThMMjAgMTdaTTI1IDE3TDI1IDE4TDI2IDE4TDI2IDE3Wk02IDE4TDYgMTlMNyAxOUw3IDE4Wk00NyAxOEw0NyAxOUw0OCAxOUw0OCAxOFpNMTAgMTlMMTAgMjBMMTEgMjBMMTEgMTlaTTE0IDE5TDE0IDIwTDEyIDIwTDEyIDIxTDEwIDIxTDEwIDIyTDEyIDIyTDEyIDIxTDEzIDIxTDEzIDIyTDE1IDIyTDE1IDI0TDE2IDI0TDE2IDIyTDE1IDIyTDE1IDE5Wk00MyAxOUw0MyAyMEw0NCAyMEw0NCAyMUw0MiAyMUw0MiAyNEw0MyAyNEw0MyAyN0w0NCAyN0w0NCAyNkw0NSAyNkw0NSAyNUw0NiAyNUw0NiAyNEw0NyAyNEw0NyAyM0w0OCAyM0w0OCAyMkw0OSAyMkw0OSAyMEw0NCAyMEw0NCAxOVpNNiAyMEw2IDIxTDcgMjFMNyAyMFpNMTYgMjBMMTYgMjFMMTcgMjFMMTcgMjNMMTggMjNMMTggMjBaTTU2IDIwTDU2IDIxTDU1IDIxTDU1IDIzTDU2IDIzTDU2IDIxTDU3IDIxTDU3IDIwWk00NCAyMUw0NCAyMkw0MyAyMkw0MyAyM0w0NSAyM0w0NSAyNEw0NiAyNEw0NiAyM0w0NyAyM0w0NyAyMUw0NiAyMUw0NiAyM0w0NSAyM0w0NSAyMVpNMjkgMjJMMjkgMjRMMzAgMjRMMzAgMjVMMjkgMjVMMjkgMjZMMzAgMjZMMzAgMjVMMzIgMjVMMzIgMjRMMzAgMjRMMzAgMjJaTTUxIDIyTDUxIDIzTDUyIDIzTDUyIDIyWk0yNiAyM0wyNiAyNEwyOCAyNEwyOCAyM1pNMzMgMjNMMzMgMjVMMzQgMjVMMzQgMjRMMzUgMjRMMzUgMjNaTTAgMjRMMCAyNUwxIDI1TDEgMjRaTTIwIDI0TDIwIDI2TDE3IDI2TDE3IDI4TDE4IDI4TDE4IDI3TDIxIDI3TDIxIDI2TDIyIDI2TDIyIDI1TDIxIDI1TDIxIDI0Wk02IDI1TDYgMjZMOCAyNkw4IDI1Wk0xMyAyNUwxMyAyNkwxNCAyNkwxNCAyNVpNMjMgMjVMMjMgMjdMMjQgMjdMMjQgMjVaTTI1IDI1TDI1IDI2TDI2IDI2TDI2IDI1Wk01IDI3TDUgMzBMOCAzMEw4IDI3Wk0yNyAyN0wyNyAzMEwzMCAzMEwzMCAyN1pNNDkgMjdMNDkgMzBMNTIgMzBMNTIgMjdaTTYgMjhMNiAyOUw3IDI5TDcgMjhaTTI4IDI4TDI4IDI5TDI5IDI5TDI5IDI4Wk0zMyAyOEwzMyAyOUwzNCAyOUwzNCAyOFpNNTAgMjhMNTAgMjlMNTEgMjlMNTEgMjhaTTE5IDI5TDE5IDMwTDIwIDMwTDIwIDI5Wk0yMiAyOUwyMiAzMEwyMSAzMEwyMSAzMUwyMiAzMUwyMiAzMEwyMyAzMEwyMyAyOVpNMTYgMzBMMTYgMzFMMTUgMzFMMTUgMzJMMTcgMzJMMTcgMzFMMTggMzFMMTggMzBaTTM5IDMwTDM5IDMxTDQwIDMxTDQwIDMwWk0yOCAzMUwyOCAzMkwyOSAzMkwyOSAzMVpNNDIgMzFMNDIgMzJMNDMgMzJMNDMgMzNMNDQgMzNMNDQgMzJMNDMgMzJMNDMgMzFaTTMwIDMyTDMwIDMzTDMxIDMzTDMxIDMyWk00OCAzMkw0OCAzM0w0OSAzM0w0OSAzNEw1MiAzNEw1MiAzM0w0OSAzM0w0OSAzMlpNOCAzM0w4IDM1TDkgMzVMOSAzNEwxMCAzNEwxMCAzM1pNMTIgMzNMMTIgMzRMMTQgMzRMMTQgMzVMMTEgMzVMMTEgMzZMMTAgMzZMMTAgMzdMOSAzN0w5IDM4TDExIDM4TDExIDM3TDEzIDM3TDEzIDM4TDE1IDM4TDE1IDM2TDE2IDM2TDE2IDM1TDE3IDM1TDE3IDM0TDE2IDM0TDE2IDM1TDE1IDM1TDE1IDMzWk0zNyAzM0wzNyAzNUwzOCAzNUwzOCAzM1pNMTQgMzVMMTQgMzZMMTUgMzZMMTUgMzVaTTIyIDM1TDIyIDM2TDIzIDM2TDIzIDM3TDI1IDM3TDI1IDM2TDI0IDM2TDI0IDM1Wk01MCAzNUw1MCAzNkw1MSAzNkw1MSAzNVpNMzIgMzdMMzIgMzhMMzMgMzhMMzMgMzdaTTQ4IDM3TDQ4IDM4TDQ3IDM4TDQ3IDM5TDQ1IDM5TDQ1IDQxTDQ2IDQxTDQ2IDQwTDQ3IDQwTDQ3IDM5TDUxIDM5TDUxIDM4TDUwIDM4TDUwIDM3Wk0yMyAzOEwyMyA0MEwyMCA0MEwyMCA0MUwyMyA0MUwyMyA0MkwyMCA0MkwyMCA0M0wxOSA0M0wxOSA0NEwxNyA0NEwxNyA0NUwxOCA0NUwxOCA0NkwyMCA0NkwyMCA0NUwyMyA0NUwyMyA0NkwyMiA0NkwyMiA0N0wyNCA0N0wyNCA0NEwyNiA0NEwyNiA0MUwyNyA0MUwyNyA0MEwyNSA0MEwyNSAzOFpNMjcgMzhMMjcgMzlMMjggMzlMMjggNDJMMjcgNDJMMjcgNDNMMjggNDNMMjggNDJMMzAgNDJMMzAgNDFMMjkgNDFMMjkgNDBMMzAgNDBMMzAgMzlMMjggMzlMMjggMzhaTTU0IDM4TDU0IDQxTDU1IDQxTDU1IDM4Wk05IDM5TDkgNDBMOCA0MEw4IDQyTDYgNDJMNiA0M0w3IDQzTDcgNDRMNiA0NEw2IDQ1TDggNDVMOCA0M0w5IDQzTDkgNDZMMTAgNDZMMTAgNDVMMTIgNDVMMTIgNDNMMTMgNDNMMTMgNDJMMTQgNDJMMTQgNDFMMTMgNDFMMTMgNDJMMTEgNDJMMTEgNDFMMTAgNDFMMTAgNDNMOSA0M0w5IDQwTDEwIDQwTDEwIDM5Wk0yNCA0MEwyNCA0MUwyNSA0MUwyNSA0MFpNNDggNDBMNDggNDFMNDcgNDFMNDcgNDJMNDYgNDJMNDYgNDNMNDUgNDNMNDUgNDJMNDQgNDJMNDQgNDFMNDIgNDFMNDIgNDJMNDEgNDJMNDEgNDRMNDIgNDRMNDIgNDVMNDEgNDVMNDEgNDZMNDAgNDZMNDAgNDdMMzkgNDdMMzkgNDhMNDAgNDhMNDAgNDdMNDEgNDdMNDEgNDlMNDIgNDlMNDIgNDdMNDEgNDdMNDEgNDZMNDMgNDZMNDMgNDdMNDQgNDdMNDQgNDZMNDUgNDZMNDUgNDRMNDYgNDRMNDYgNDVMNDcgNDVMNDcgNDRMNDYgNDRMNDYgNDNMNDggNDNMNDggNDJMNDkgNDJMNDkgNDNMNTAgNDNMNTAgNDJMNDkgNDJMNDkgNDFMNTAgNDFMNTAgNDBaTTIzIDQyTDIzIDQzTDIwIDQzTDIwIDQ0TDE5IDQ0TDE5IDQ1TDIwIDQ1TDIwIDQ0TDIzIDQ0TDIzIDQzTDI1IDQzTDI1IDQyWk0zMyA0MkwzMyA0M0wzNCA0M0wzNCA0NEwzNSA0NEwzNSA0M0wzNCA0M0wzNCA0MlpNMTAgNDNMMTAgNDRMMTEgNDRMMTEgNDNaTTMxIDQzTDMxIDQ0TDMwIDQ0TDMwIDQ1TDMxIDQ1TDMxIDQ0TDMyIDQ0TDMyIDQzWk00MiA0M0w0MiA0NEw0MyA0NEw0MyA0M1pNNDggNDRMNDggNDVMNDkgNDVMNDkgNDRaTTQzIDQ1TDQzIDQ2TDQ0IDQ2TDQ0IDQ1Wk0yNyA0N0wyNyA0OEwyOCA0OEwyOCA0N1pNNDUgNDdMNDUgNDhMNDQgNDhMNDQgNDlMNDUgNDlMNDUgNDhMNDYgNDhMNDYgNDlMNDcgNDlMNDcgNDhMNDYgNDhMNDYgNDdaTTMxIDQ4TDMxIDQ5TDMyIDQ5TDMyIDQ4Wk0zMyA0OEwzMyA0OUwzNCA0OUwzNCA0OFpNMjcgNDlMMjcgNTJMMzAgNTJMMzAgNDlaTTQ5IDQ5TDQ5IDUyTDUyIDUyTDUyIDQ5Wk0yOCA1MEwyOCA1MUwyOSA1MUwyOSA1MFpNNDUgNTBMNDUgNTFMNDQgNTFMNDQgNTJMNDIgNTJMNDIgNTVMNDMgNTVMNDMgNTRMNDQgNTRMNDQgNTNMNDUgNTNMNDUgNTRMNDYgNTRMNDYgNTNMNDcgNTNMNDcgNTJMNDYgNTJMNDYgNTNMNDUgNTNMNDUgNTFMNDYgNTFMNDYgNTBaTTUwIDUwTDUwIDUxTDUxIDUxTDUxIDUwWk01NCA1MEw1NCA1MUw1MyA1MUw1MyA1M0w1NCA1M0w1NCA1NEw1NSA1NEw1NSA1M0w1NiA1M0w1NiA1Mkw1NSA1Mkw1NSA1MFpNMjQgNTNMMjQgNTVMMjUgNTVMMjUgNTZMMjYgNTZMMjYgNTVMMjUgNTVMMjUgNTRMMjYgNTRMMjYgNTNaTTMzIDUzTDMzIDU0TDM0IDU0TDM0IDUzWk01MSA1M0w1MSA1NEw1MiA1NEw1MiA1M1pNMjAgNTRMMjAgNTVMMjEgNTVMMjEgNTRaTTM0IDU1TDM0IDU2TDM1IDU2TDM1IDU1Wk0xOSA1NkwxOSA1N0wyMCA1N0wyMCA1NlpNNTIgNTZMNTIgNTdMNTMgNTdMNTMgNTZaTTU2IDU2TDU2IDU3TDU3IDU3TDU3IDU2Wk0wIDBMMCA3TDcgN0w3IDBaTTEgMUwxIDZMNiA2TDYgMVpNMiAyTDIgNUw1IDVMNSAyWk01MCAwTDUwIDdMNTcgN0w1NyAwWk01MSAxTDUxIDZMNTYgNkw1NiAxWk01MiAyTDUyIDVMNTUgNUw1NSAyWk0wIDUwTDAgNTdMNyA1N0w3IDUwWk0xIDUxTDEgNTZMNiA1Nkw2IDUxWk0yIDUyTDIgNTVMNSA1NUw1IDUyWiIgZmlsbD0iIzAwMDAwMCIvPjwvZz48L2c+PC9zdmc+Cg==	data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyIgPz4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+DQo8c3ZnIHdpZHRoPSIyMzciIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCAyMzcgODAiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCgk8ZGVzYz4wMDAwMDAwMjwvZGVzYz4NCgk8ZyBpZD0iYmFycyIgZmlsbD0icmdiKDAsMCwwKSIgc3Ryb2tlPSJub25lIj4NCgkJPHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjYiIGhlaWdodD0iODAiIC8+DQoJCTxyZWN0IHg9IjkiIHk9IjAiIHdpZHRoPSIzIiBoZWlnaHQ9IjgwIiAvPg0KCQk8cmVjdCB4PSIxOCIgeT0iMCIgd2lkdGg9IjkiIGhlaWdodD0iODAiIC8+DQoJCTxyZWN0IHg9IjMzIiB5PSIwIiB3aWR0aD0iNiIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iNDIiIHk9IjAiIHdpZHRoPSI2IiBoZWlnaHQ9IjgwIiAvPg0KCQk8cmVjdCB4PSI1NCIgeT0iMCIgd2lkdGg9IjYiIGhlaWdodD0iODAiIC8+DQoJCTxyZWN0IHg9IjY2IiB5PSIwIiB3aWR0aD0iNiIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iNzUiIHk9IjAiIHdpZHRoPSI2IiBoZWlnaHQ9IjgwIiAvPg0KCQk8cmVjdCB4PSI4NyIgeT0iMCIgd2lkdGg9IjYiIGhlaWdodD0iODAiIC8+DQoJCTxyZWN0IHg9Ijk5IiB5PSIwIiB3aWR0aD0iNiIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMTA4IiB5PSIwIiB3aWR0aD0iNiIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMTIwIiB5PSIwIiB3aWR0aD0iNiIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMTMyIiB5PSIwIiB3aWR0aD0iNiIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMTQ0IiB5PSIwIiB3aWR0aD0iNiIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMTU2IiB5PSIwIiB3aWR0aD0iNiIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMTY1IiB5PSIwIiB3aWR0aD0iNiIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMTc3IiB5PSIwIiB3aWR0aD0iMyIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMTg5IiB5PSIwIiB3aWR0aD0iMyIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMTk4IiB5PSIwIiB3aWR0aD0iNiIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMjEzIiB5PSIwIiB3aWR0aD0iOSIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMjI1IiB5PSIwIiB3aWR0aD0iMyIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMjMxIiB5PSIwIiB3aWR0aD0iNiIgaGVpZ2h0PSI4MCIgLz4NCgk8L2c+DQo8L3N2Zz4NCg==
4	OMNIA 24 inches	1	Omnia	23ds2e2e2	3846.58	12252442414	2025-07-23	4500	2026-03-18	3	2	1	\N	1	2025-12-16 01:22:57	2025-12-29 01:50:26	data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZlcnNpb249IjEuMSIgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIHZpZXdCb3g9IjAgMCAzMDAgMzAwIj48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2ZmZmZmZiIvPjxnIHRyYW5zZm9ybT0ic2NhbGUoNC45MTgpIj48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgwLDApIj48cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik04IDBMOCAxTDkgMUw5IDBaTTEzIDBMMTMgMUwxMiAxTDEyIDJMMTMgMkwxMyAzTDEyIDNMMTIgNEwxMSA0TDExIDJMOCAyTDggM0wxMCAzTDEwIDRMOCA0TDggNUw5IDVMOSA2TDggNkw4IDhMOSA4TDkgOUw3IDlMNyA4TDUgOEw1IDExTDQgMTFMNCAxMEwzIDEwTDMgOUwyIDlMMiAxMEwxIDEwTDEgMTFMMCAxMUwwIDE0TDIgMTRMMiAxNUwwIDE1TDAgMTZMMSAxNkwxIDE3TDAgMTdMMCAxOUwyIDE5TDIgMjBMMSAyMEwxIDIxTDIgMjFMMiAyMkw1IDIyTDUgMjNMNCAyM0w0IDI0TDMgMjRMMyAyNUw0IDI1TDQgMjZMNSAyNkw1IDI1TDcgMjVMNyAyNkw2IDI2TDYgMjdMOCAyN0w4IDI4TDQgMjhMNCAzMEwzIDMwTDMgMzFMMSAzMUwxIDMyTDAgMzJMMCAzM0wzIDMzTDMgMzRMNCAzNEw0IDM1TDMgMzVMMyAzNkwyIDM2TDIgMzRMMCAzNEwwIDM2TDEgMzZMMSAzOEwyIDM4TDIgMzdMNCAzN0w0IDM4TDMgMzhMMyAzOUwyIDM5TDIgNDBMMCA0MEwwIDQyTDEgNDJMMSA0MUwyIDQxTDIgNDNMMSA0M0wxIDQ0TDAgNDRMMCA0N0wxIDQ3TDEgNDVMMiA0NUwyIDQ0TDMgNDRMMyA0NkwyIDQ2TDIgNDlMMSA0OUwxIDQ4TDAgNDhMMCA0OUwxIDQ5TDEgNTBMMiA1MEwyIDUxTDAgNTFMMCA1M0w0IDUzTDQgNTJMNSA1Mkw1IDUxTDcgNTFMNyA1MEw4IDUwTDggNDlMNyA0OUw3IDQ4TDggNDhMOCA0N0w5IDQ3TDkgNDVMMTEgNDVMMTEgNDZMMTAgNDZMMTAgNDdMMTEgNDdMMTEgNDhMOSA0OEw5IDQ5TDEwIDQ5TDEwIDU0TDExIDU0TDExIDU1TDEwIDU1TDEwIDU3TDkgNTdMOSA1OEwxMCA1OEwxMCA1OUw5IDU5TDkgNjFMMTEgNjFMMTEgNjBMMTIgNjBMMTIgNjFMMTMgNjFMMTMgNjBMMTQgNjBMMTQgNTlMMTYgNTlMMTYgNjBMMTcgNjBMMTcgNjFMMTkgNjFMMTkgNjBMMjEgNjBMMjEgNTlMMjIgNTlMMjIgNjFMMjQgNjFMMjQgNjBMMjcgNjBMMjcgNjFMMjggNjFMMjggNjBMMjcgNjBMMjcgNTlMMjggNTlMMjggNThMMjkgNThMMjkgNTlMMzAgNTlMMzAgNjBMMjkgNjBMMjkgNjFMMzEgNjFMMzEgNjBMMzIgNjBMMzIgNTlMMzAgNTlMMzAgNThMMzEgNThMMzEgNTdMMzIgNTdMMzIgNThMMzMgNThMMzMgNTlMMzQgNTlMMzQgNjBMMzUgNjBMMzUgNTlMMzcgNTlMMzcgNjBMMzYgNjBMMzYgNjFMMzggNjFMMzggNjBMMzkgNjBMMzkgNjFMNDIgNjFMNDIgNjBMNDMgNjBMNDMgNjFMNDYgNjFMNDYgNjBMNDUgNjBMNDUgNTlMNDcgNTlMNDcgNjBMNDggNjBMNDggNjFMNTAgNjFMNTAgNjBMNDggNjBMNDggNTlMNTIgNTlMNTIgNjBMNTEgNjBMNTEgNjFMNTUgNjFMNTUgNjBMNTYgNjBMNTYgNjFMNTcgNjFMNTcgNjBMNTggNjBMNTggNTlMNTcgNTlMNTcgNjBMNTYgNjBMNTYgNThMNTMgNThMNTMgNTlMNTIgNTlMNTIgNThMNTEgNThMNTEgNTdMNTcgNTdMNTcgNThMNTkgNThMNTkgNTdMNTggNTdMNTggNTVMNTkgNTVMNTkgNTZMNjAgNTZMNjAgNjFMNjEgNjFMNjEgNTRMNjAgNTRMNjAgNTNMNjEgNTNMNjEgNTJMNjAgNTJMNjAgNTNMNTkgNTNMNTkgNTFMNjEgNTFMNjEgNDhMNjAgNDhMNjAgNDdMNjEgNDdMNjEgNDZMNTggNDZMNTggNDRMNTYgNDRMNTYgNDVMNTUgNDVMNTUgNDNMNTYgNDNMNTYgNDJMNTUgNDJMNTUgNDBMNTYgNDBMNTYgNDFMNTcgNDFMNTcgNDJMNTggNDJMNTggNDNMNTkgNDNMNTkgNDVMNjAgNDVMNjAgNDNMNjEgNDNMNjEgNDJMNjAgNDJMNjAgNDNMNTkgNDNMNTkgNDFMNjEgNDFMNjEgMzhMNjAgMzhMNjAgMzdMNjEgMzdMNjEgMzRMNTggMzRMNTggMzNMNjEgMzNMNjEgMzBMNjAgMzBMNjAgMzJMNTggMzJMNTggMzFMNTcgMzFMNTcgMzBMNTkgMzBMNTkgMjdMNjEgMjdMNjEgMjVMNjAgMjVMNjAgMjZMNTkgMjZMNTkgMjdMNTcgMjdMNTcgMjZMNTggMjZMNTggMjVMNTYgMjVMNTYgMjZMNTUgMjZMNTUgMjVMNTQgMjVMNTQgMjRMNTUgMjRMNTUgMjNMNTQgMjNMNTQgMjJMNTYgMjJMNTYgMjNMNTkgMjNMNTkgMjBMNTggMjBMNTggMThMNjAgMThMNjAgMTlMNjEgMTlMNjEgMThMNjAgMThMNjAgMTdMNjEgMTdMNjEgMTRMNjAgMTRMNjAgMTNMNjEgMTNMNjEgMTJMNjAgMTJMNjAgMTFMNjEgMTFMNjEgMTBMNjAgMTBMNjAgOUw2MSA5TDYxIDhMNjAgOEw2MCA5TDU5IDlMNTkgOEw1OCA4TDU4IDlMNTcgOUw1NyA4TDU2IDhMNTYgOUw1NSA5TDU1IDhMNTQgOEw1NCAxMEw1NiAxMEw1NiA5TDU3IDlMNTcgMTBMNTggMTBMNTggMTFMNTcgMTFMNTcgMTJMNTYgMTJMNTYgMTRMNTUgMTRMNTUgMTJMNTQgMTJMNTQgMTFMNTIgMTFMNTIgMTBMNTMgMTBMNTMgOEw1MiA4TDUyIDdMNTMgN0w1MyA2TDUyIDZMNTIgN0w1MSA3TDUxIDVMNTIgNUw1MiA0TDUzIDRMNTMgMEw1MSAwTDUxIDJMNTAgMkw1MCAwTDQ5IDBMNDkgMkw0NyAyTDQ3IDFMNDggMUw0OCAwTDQ1IDBMNDUgMUw0MyAxTDQzIDBMNDIgMEw0MiAxTDQzIDFMNDMgMkw0MiAyTDQyIDNMNDMgM0w0MyAyTDQ0IDJMNDQgNEw0NyA0TDQ3IDVMNDYgNUw0NiA3TDQ1IDdMNDUgNkw0NCA2TDQ0IDVMNDMgNUw0MyA0TDQxIDRMNDEgM0w0MCAzTDQwIDRMMzkgNEwzOSAzTDM4IDNMMzggMUwzNiAxTDM2IDBMMzUgMEwzNSAxTDM0IDFMMzQgMEwzMSAwTDMxIDJMMzIgMkwzMiA0TDI5IDRMMjkgM0wyOCAzTDI4IDhMMjYgOEwyNiA5TDI1IDlMMjUgOEwyNCA4TDI0IDdMMjUgN0wyNSA1TDI2IDVMMjYgN0wyNyA3TDI3IDVMMjYgNUwyNiA0TDI0IDRMMjQgN0wyMyA3TDIzIDRMMjIgNEwyMiAzTDIxIDNMMjEgMkwxOSAyTDE5IDNMMjAgM0wyMCA0TDE5IDRMMTkgNkwxOCA2TDE4IDdMMTcgN0wxNyA1TDE4IDVMMTggNEwxNyA0TDE3IDNMMTggM0wxOCAwTDE1IDBMMTUgMUwxNCAxTDE0IDBaTTE5IDBMMTkgMUwyMCAxTDIwIDBaTTIyIDBMMjIgMkwyNCAyTDI0IDBaTTI3IDBMMjcgMUwyNiAxTDI2IDJMMjcgMkwyNyAxTDI4IDFMMjggMFpNMjkgMEwyOSAxTDMwIDFMMzAgMFpNMzkgMEwzOSAyTDQwIDJMNDAgMUw0MSAxTDQxIDBaTTEzIDFMMTMgMkwxNCAyTDE0IDFaTTE1IDFMMTUgM0wxNyAzTDE3IDJMMTYgMkwxNiAxWk0zMyAxTDMzIDNMMzQgM0wzNCAxWk0zNiAyTDM2IDNMMzUgM0wzNSA0TDM3IDRMMzcgNUwzNiA1TDM2IDZMMzUgNkwzNSA1TDM0IDVMMzQgNEwzMyA0TDMzIDVMMzQgNUwzNCA2TDMzIDZMMzMgOEwzNCA4TDM0IDlMMzEgOUwzMSAxMEwzMiAxMEwzMiAxMUwzMCAxMUwzMCAxMEwyOCAxMEwyOCAxMUwyNyAxMUwyNyAxMEwyNiAxMEwyNiAxMUwyNyAxMUwyNyAxMkwyNCAxMkwyNCA4TDIzIDhMMjMgN0wyMiA3TDIyIDZMMjEgNkwyMSA3TDIwIDdMMjAgNkwxOSA2TDE5IDdMMjAgN0wyMCA5TDE5IDlMMTkgOEwxOCA4TDE4IDlMMTYgOUwxNiA4TDE3IDhMMTcgN0wxNiA3TDE2IDZMMTUgNkwxNSA3TDE0IDdMMTQgNUwxMyA1TDEzIDdMMTIgN0wxMiA2TDExIDZMMTEgN0wxMiA3TDEyIDhMMTEgOEwxMSA5TDEwIDlMMTAgMTBMMTEgMTBMMTEgMTFMMTAgMTFMMTAgMTJMOSAxMkw5IDE0TDExIDE0TDExIDE1TDEwIDE1TDEwIDE2TDkgMTZMOSAxNUw4IDE1TDggMTZMNyAxNkw3IDE1TDYgMTVMNiAxNEw4IDE0TDggMTJMNyAxMkw3IDExTDggMTFMOCAxMEw3IDEwTDcgOUw2IDlMNiAxMEw3IDEwTDcgMTFMNiAxMUw2IDEyTDUgMTJMNSAxM0w2IDEzTDYgMTRMNSAxNEw1IDE3TDQgMTdMNCAxOEw1IDE4TDUgMjBMNCAyMEw0IDE5TDMgMTlMMyAxN0wxIDE3TDEgMThMMiAxOEwyIDE5TDMgMTlMMyAyMEw0IDIwTDQgMjFMNSAyMUw1IDIyTDcgMjJMNyAyM0w2IDIzTDYgMjRMNyAyNEw3IDIzTDggMjNMOCAyMUwxMSAyMUwxMSAyMkw5IDIyTDkgMjNMMTEgMjNMMTEgMjRMOSAyNEw5IDI1TDggMjVMOCAyNkw5IDI2TDkgMjdMMTAgMjdMMTAgMjZMMTEgMjZMMTEgMjVMMTMgMjVMMTMgMjZMMTIgMjZMMTIgMjlMMTEgMjlMMTEgMjhMMTAgMjhMMTAgMjlMOSAyOUw5IDMwTDEyIDMwTDEyIDMxTDEzIDMxTDEzIDMzTDE1IDMzTDE1IDM1TDE0IDM1TDE0IDM2TDEzIDM2TDEzIDM3TDEyIDM3TDEyIDM2TDEwIDM2TDEwIDM1TDkgMzVMOSAzM0w2IDMzTDYgMzRMNSAzNEw1IDM1TDYgMzVMNiAzNkw3IDM2TDcgMzVMOCAzNUw4IDM2TDEwIDM2TDEwIDM5TDkgMzlMOSA0MEwxMiA0MEwxMiA0MUwxMCA0MUwxMCA0Mkw4IDQyTDggMzlMNiAzOUw2IDM4TDcgMzhMNyAzN0w1IDM3TDUgMzZMNCAzNkw0IDM3TDUgMzdMNSAzOUw0IDM5TDQgNDFMMyA0MUwzIDQwTDIgNDBMMiA0MUwzIDQxTDMgNDJMNCA0Mkw0IDQzTDMgNDNMMyA0NEw0IDQ0TDQgNDZMOCA0Nkw4IDQ0TDEwIDQ0TDEwIDQzTDEyIDQzTDEyIDQxTDE0IDQxTDE0IDQyTDE3IDQyTDE3IDQwTDE4IDQwTDE4IDQxTDE5IDQxTDE5IDQyTDIwIDQyTDIwIDQwTDIxIDQwTDIxIDM5TDIzIDM5TDIzIDQwTDI0IDQwTDI0IDM3TDIzIDM3TDIzIDM2TDIyIDM2TDIyIDMyTDIxIDMyTDIxIDMxTDE5IDMxTDE5IDI5TDE3IDI5TDE3IDI4TDIwIDI4TDIwIDI3TDIxIDI3TDIxIDI1TDIyIDI1TDIyIDI4TDIxIDI4TDIxIDI5TDIwIDI5TDIwIDMwTDIyIDMwTDIyIDMxTDIzIDMxTDIzIDMzTDI1IDMzTDI1IDM0TDI3IDM0TDI3IDM2TDI2IDM2TDI2IDM1TDI0IDM1TDI0IDM2TDI1IDM2TDI1IDM4TDI2IDM4TDI2IDM5TDI1IDM5TDI1IDQxTDIzIDQxTDIzIDQyTDIxIDQyTDIxIDQzTDI0IDQzTDI0IDQ0TDIwIDQ0TDIwIDQ3TDE5IDQ3TDE5IDQzTDE4IDQzTDE4IDQ0TDE3IDQ0TDE3IDQzTDE2IDQzTDE2IDQ0TDE1IDQ0TDE1IDQ1TDE2IDQ1TDE2IDQ2TDE1IDQ2TDE1IDQ4TDE2IDQ4TDE2IDQ5TDE4IDQ5TDE4IDUwTDE0IDUwTDE0IDUxTDEzIDUxTDEzIDUwTDEyIDUwTDEyIDQ4TDExIDQ4TDExIDUyTDEyIDUyTDEyIDUzTDExIDUzTDExIDU0TDEzIDU0TDEzIDU1TDExIDU1TDExIDU3TDEwIDU3TDEwIDU4TDExIDU4TDExIDU5TDEyIDU5TDEyIDYwTDEzIDYwTDEzIDU5TDE0IDU5TDE0IDU3TDEyIDU3TDEyIDU2TDEzIDU2TDEzIDU1TDE0IDU1TDE0IDU2TDE1IDU2TDE1IDU3TDE2IDU3TDE2IDU2TDE4IDU2TDE4IDU3TDE3IDU3TDE3IDU4TDE2IDU4TDE2IDU5TDE3IDU5TDE3IDU4TDE5IDU4TDE5IDU2TDIxIDU2TDIxIDU4TDIyIDU4TDIyIDU5TDIzIDU5TDIzIDYwTDI0IDYwTDI0IDU5TDI3IDU5TDI3IDU4TDI4IDU4TDI4IDU3TDI3IDU3TDI3IDU1TDI4IDU1TDI4IDUzTDI3IDUzTDI3IDU1TDI2IDU1TDI2IDU0TDI1IDU0TDI1IDUzTDI0IDUzTDI0IDU0TDIzIDU0TDIzIDU3TDIyIDU3TDIyIDU1TDE5IDU1TDE5IDUzTDIwIDUzTDIwIDU0TDIyIDU0TDIyIDUzTDIzIDUzTDIzIDUyTDI1IDUyTDI1IDUwTDI0IDUwTDI0IDQ3TDI2IDQ3TDI2IDQ4TDI1IDQ4TDI1IDQ5TDI4IDQ5TDI4IDQ4TDI5IDQ4TDI5IDQ5TDMwIDQ5TDMwIDUxTDMxIDUxTDMxIDUwTDMyIDUwTDMyIDUxTDMzIDUxTDMzIDU4TDM0IDU4TDM0IDU1TDM3IDU1TDM3IDU2TDM1IDU2TDM1IDU3TDM2IDU3TDM2IDU4TDM3IDU4TDM3IDU3TDQyIDU3TDQyIDU2TDQzIDU2TDQzIDU4TDQ0IDU4TDQ0IDU3TDQ1IDU3TDQ1IDU2TDQ3IDU2TDQ3IDU5TDQ4IDU5TDQ4IDU4TDUwIDU4TDUwIDU2TDUyIDU2TDUyIDUzTDUxIDUzTDUxIDUyTDUwIDUyTDUwIDUwTDUxIDUwTDUxIDQ3TDQ5IDQ3TDQ5IDQ4TDQ4IDQ4TDQ4IDQ2TDQ5IDQ2TDQ5IDQ1TDUwIDQ1TDUwIDQ0TDUxIDQ0TDUxIDQzTDUzIDQzTDUzIDQyTDUyIDQyTDUyIDQxTDU0IDQxTDU0IDQwTDU1IDQwTDU1IDM5TDU0IDM5TDU0IDM4TDU1IDM4TDU1IDM3TDUzIDM3TDUzIDM2TDU2IDM2TDU2IDQwTDU3IDQwTDU3IDQxTDU4IDQxTDU4IDM5TDU3IDM5TDU3IDM4TDU5IDM4TDU5IDM5TDYwIDM5TDYwIDM4TDU5IDM4TDU5IDM3TDYwIDM3TDYwIDM1TDU4IDM1TDU4IDM0TDU3IDM0TDU3IDM1TDU4IDM1TDU4IDM3TDU3IDM3TDU3IDM2TDU2IDM2TDU2IDMzTDUzIDMzTDUzIDM0TDUyIDM0TDUyIDM1TDUzIDM1TDUzIDM2TDUyIDM2TDUyIDM3TDUxIDM3TDUxIDM2TDUwIDM2TDUwIDM4TDQ5IDM4TDQ5IDM3TDQ3IDM3TDQ3IDM1TDQ4IDM1TDQ4IDM2TDQ5IDM2TDQ5IDM1TDUwIDM1TDUwIDMzTDUxIDMzTDUxIDMyTDUyIDMyTDUyIDMxTDUwIDMxTDUwIDMwTDUxIDMwTDUxIDI5TDUyIDI5TDUyIDI4TDUzIDI4TDUzIDI3TDU0IDI3TDU0IDI4TDU3IDI4TDU3IDI3TDU1IDI3TDU1IDI2TDU0IDI2TDU0IDI1TDUzIDI1TDUzIDI3TDUyIDI3TDUyIDI4TDUwIDI4TDUwIDI2TDUxIDI2TDUxIDI0TDUyIDI0TDUyIDIzTDUzIDIzTDUzIDI0TDU0IDI0TDU0IDIzTDUzIDIzTDUzIDIyTDUxIDIyTDUxIDIzTDUwIDIzTDUwIDIxTDUxIDIxTDUxIDE5TDU0IDE5TDU0IDIxTDU2IDIxTDU2IDIyTDU4IDIyTDU4IDIwTDU2IDIwTDU2IDE4TDU3IDE4TDU3IDE1TDU2IDE1TDU2IDE4TDU0IDE4TDU0IDE2TDUzIDE2TDUzIDE3TDUyIDE3TDUyIDE4TDUxIDE4TDUxIDE3TDUwIDE3TDUwIDE0TDUxIDE0TDUxIDE2TDUyIDE2TDUyIDE1TDU1IDE1TDU1IDE0TDUzIDE0TDUzIDEzTDU0IDEzTDU0IDEyTDUyIDEyTDUyIDEzTDUwIDEzTDUwIDExTDQ4IDExTDQ4IDEwTDUwIDEwTDUwIDlMNTEgOUw1MSAxMEw1MiAxMEw1MiA5TDUxIDlMNTEgN0w1MCA3TDUwIDZMNDkgNkw0OSA3TDQ4IDdMNDggNUw0NyA1TDQ3IDdMNDYgN0w0NiA5TDQ1IDlMNDUgOEw0NCA4TDQ0IDZMNDMgNkw0MyA1TDM5IDVMMzkgNEwzNyA0TDM3IDJaTTQ1IDJMNDUgM0w0NiAzTDQ2IDJaTTQ5IDJMNDkgM0w1MCAzTDUwIDJaTTQ3IDNMNDcgNEw0OCA0TDQ4IDNaTTUxIDNMNTEgNEw1MiA0TDUyIDNaTTEwIDRMMTAgNUwxMSA1TDExIDRaTTE2IDRMMTYgNUwxNyA1TDE3IDRaTTIxIDRMMjEgNUwyMiA1TDIyIDRaTTI5IDVMMjkgOEwzMiA4TDMyIDVaTTM3IDVMMzcgNkwzNiA2TDM2IDdMMzcgN0wzNyA2TDM4IDZMMzggMTBMMzcgMTBMMzcgOUwzNiA5TDM2IDhMMzUgOEwzNSA2TDM0IDZMMzQgOEwzNSA4TDM1IDlMMzYgOUwzNiAxMEwzNCAxMEwzNCAxMUwzNSAxMUwzNSAxMkwzNCAxMkwzNCAxM0wzNSAxM0wzNSAxNEwzMyAxNEwzMyAxNUwzNCAxNUwzNCAxNkwzMyAxNkwzMyAxOEwzMiAxOEwzMiAyMEwzMSAyMEwzMSAyMUwzMCAyMUwzMCAyMkwzMSAyMkwzMSAyM0wzMCAyM0wzMCAyNEwyOCAyNEwyOCAyM0wyNSAyM0wyNSAyNUwyMyAyNUwyMyAyNkwyNCAyNkwyNCAyN0wyMyAyN0wyMyAyOUwyNCAyOUwyNCAzMUwyNSAzMUwyNSAyN0wyNyAyN0wyNyAzMEwyNiAzMEwyNiAzM0wyNyAzM0wyNyAzNEwyOCAzNEwyOCAzNUwzMCAzNUwzMCAzNEwzMSAzNEwzMSAzNUwzMiAzNUwzMiAzNkwzNCAzNkwzNCAzNUwzMiAzNUwzMiAzNEwzNCAzNEwzNCAzM0wzMyAzM0wzMyAzMkwzNSAzMkwzNSAzMUwzNiAzMUwzNiAzM0wzNSAzM0wzNSAzNEwzNiAzNEwzNiAzM0wzNyAzM0wzNyAzNEwzOCAzNEwzOCAzNkwzNyAzNkwzNyAzN0wzNCAzN0wzNCAzOEwzMSAzOEwzMSAzNkwyOSAzNkwyOSAzN0wyOCAzN0wyOCAzNkwyNyAzNkwyNyAzN0wyNiAzN0wyNiAzOEwyNyAzOEwyNyAzN0wyOCAzN0wyOCAzOEwzMSAzOEwzMSA0MEwzMyA0MEwzMyAzOUwzNSAzOUwzNSAzOEwzNiAzOEwzNiAzOUwzNyAzOUwzNyA0MEwzNSA0MEwzNSA0MUw0MCA0MUw0MCA0MkwzOCA0MkwzOCA0M0wzNyA0M0wzNyA0NUwzNiA0NUwzNiA0NEwzNCA0NEwzNCA0NUwzMyA0NUwzMyA0M0wzMSA0M0wzMSA0MUwzMCA0MUwzMCA0MkwyOSA0MkwyOSA0MUwyOCA0MUwyOCA0MkwyNiA0MkwyNiA0MUwyNSA0MUwyNSA0MkwyNiA0MkwyNiA0M0wyNSA0M0wyNSA0NEwyNCA0NEwyNCA0NUwyNiA0NUwyNiA0N0wyNyA0N0wyNyA0OEwyOCA0OEwyOCA0NkwyNyA0NkwyNyA0NUwyOCA0NUwyOCA0NEwyOSA0NEwyOSA0M0wzMCA0M0wzMCA0NUwyOSA0NUwyOSA0N0wzMCA0N0wzMCA0OEwzMiA0OEwzMiA1MEwzMyA1MEwzMyA1MUwzNSA1MUwzNSA1MkwzNCA1MkwzNCA1M0wzNSA1M0wzNSA1NEwzNiA1NEwzNiA1MkwzNyA1MkwzNyA1MUwzOSA1MUwzOSA1Mkw0MCA1Mkw0MCA1MUw0MiA1MUw0MiA1Mkw0MSA1Mkw0MSA1M0w0MiA1M0w0MiA1NUw0MCA1NUw0MCA1M0wzOCA1M0wzOCA1NEwzNyA1NEwzNyA1NUwzOCA1NUwzOCA1Nkw0MiA1Nkw0MiA1NUw0MyA1NUw0MyA1NEw0NCA1NEw0NCA1Mkw0MyA1Mkw0MyA1MUw0NiA1MUw0NiA1Mkw0NSA1Mkw0NSA1NUw0NCA1NUw0NCA1Nkw0NSA1Nkw0NSA1NUw0NiA1NUw0NiA1Mkw0NyA1Mkw0NyA1M0w0OCA1M0w0OCA1NUw0OSA1NUw0OSA1M0w1MCA1M0w1MCA1Mkw0OCA1Mkw0OCA1MEw0NSA1MEw0NSA0OEw0NiA0OEw0NiA0OUw0NyA0OUw0NyA0OEw0NiA0OEw0NiA0N0w0NyA0N0w0NyA0NUw0NiA0NUw0NiA0M0w0NyA0M0w0NyA0NEw0OCA0NEw0OCA0NUw0OSA0NUw0OSA0NEw0OCA0NEw0OCA0M0w0OSA0M0w0OSA0MEw0NiA0MEw0NiAzOUw0NyAzOUw0NyAzOEw0NiAzOEw0NiAzNkw0NCAzNkw0NCAzNUw0NyAzNUw0NyAzNEw0OCAzNEw0OCAzNUw0OSAzNUw0OSAzNEw0OCAzNEw0OCAzM0w0OSAzM0w0OSAzMkw1MCAzMkw1MCAzMUw0OSAzMUw0OSAzMEw0NyAzMEw0NyAzMUw0OSAzMUw0OSAzMkw0NSAzMkw0NSAzMUw0NiAzMUw0NiAyOUw0NCAyOUw0NCAzMEw0MyAzMEw0MyAyOUw0MiAyOUw0MiAzMEw0MyAzMEw0MyAzMUw0MiAzMUw0MiAzMkw0MSAzMkw0MSAzM0wzOSAzM0wzOSAzMUwzOCAzMUwzOCAyOUw0MCAyOUw0MCAyOEw0MSAyOEw0MSAyNkw0NCAyNkw0NCAyN0w0MiAyN0w0MiAyOEw0NCAyOEw0NCAyN0w0NiAyN0w0NiAyOEw0OCAyOEw0OCAyOUw1MCAyOUw1MCAyOEw0OCAyOEw0OCAyN0w0OSAyN0w0OSAyNkw1MCAyNkw1MCAyNUw0OSAyNUw0OSAyNEw0NyAyNEw0NyAyNUw0OCAyNUw0OCAyNkw0NyAyNkw0NyAyN0w0NiAyN0w0NiAyNEw0NSAyNEw0NSAyM0w0NyAyM0w0NyAyMEw0NSAyMEw0NSAxOUw0NiAxOUw0NiAxOEw0NCAxOEw0NCAxN0w0MiAxN0w0MiAxOEw0MSAxOEw0MSAxNEw0MyAxNEw0MyAxM0w0MiAxM0w0MiAxMkw0MyAxMkw0MyAxMUw0NCAxMUw0NCAxNEw0NiAxNEw0NiAxNUw0OCAxNUw0OCAxNEw0OSAxNEw0OSAxMkw0NiAxMkw0NiAxMUw0NyAxMUw0NyAxMEw0OCAxMEw0OCA5TDQ5IDlMNDkgOEw1MCA4TDUwIDdMNDkgN0w0OSA4TDQ4IDhMNDggN0w0NyA3TDQ3IDhMNDggOEw0OCA5TDQ2IDlMNDYgMTBMNDQgMTBMNDQgOEw0MyA4TDQzIDEwTDQyIDEwTDQyIDlMNDEgOUw0MSA4TDQyIDhMNDIgN0w0MyA3TDQzIDZMNDIgNkw0MiA3TDQxIDdMNDEgNkw0MCA2TDQwIDdMNDEgN0w0MSA4TDM5IDhMMzkgNkwzOCA2TDM4IDVaTTkgNkw5IDhMMTAgOEwxMCA2Wk0zMCA2TDMwIDdMMzEgN0wzMSA2Wk0xMyA3TDEzIDhMMTQgOEwxNCA5TDExIDlMMTEgMTBMMTMgMTBMMTMgMTFMMTEgMTFMMTEgMTNMMTMgMTNMMTMgMTRMMTIgMTRMMTIgMTVMMTEgMTVMMTEgMTdMMTIgMTdMMTIgMjBMMTEgMjBMMTEgMTlMOSAxOUw5IDE4TDYgMThMNiAxN0w3IDE3TDcgMTZMNiAxNkw2IDE3TDUgMTdMNSAxOEw2IDE4TDYgMTlMNyAxOUw3IDIwTDYgMjBMNiAyMUw4IDIxTDggMTlMOSAxOUw5IDIwTDExIDIwTDExIDIxTDEyIDIxTDEyIDIwTDEzIDIwTDEzIDE5TDE0IDE5TDE0IDE4TDE1IDE4TDE1IDIwTDE0IDIwTDE0IDIxTDE1IDIxTDE1IDIwTDE2IDIwTDE2IDE5TDE4IDE5TDE4IDIyTDE3IDIyTDE3IDIxTDE2IDIxTDE2IDIyTDE1IDIyTDE1IDIzTDE2IDIzTDE2IDI0TDE1IDI0TDE1IDI2TDEzIDI2TDEzIDI3TDE1IDI3TDE1IDMwTDE0IDMwTDE0IDI4TDEzIDI4TDEzIDI5TDEyIDI5TDEyIDMwTDE0IDMwTDE0IDMxTDE1IDMxTDE1IDMwTDE3IDMwTDE3IDMxTDE2IDMxTDE2IDMyTDE1IDMyTDE1IDMzTDE2IDMzTDE2IDM0TDE4IDM0TDE4IDMzTDE3IDMzTDE3IDMxTDE4IDMxTDE4IDMyTDE5IDMyTDE5IDM1TDE1IDM1TDE1IDM2TDE0IDM2TDE0IDQwTDE1IDQwTDE1IDQxTDE2IDQxTDE2IDQwTDE1IDQwTDE1IDM3TDE2IDM3TDE2IDM5TDE3IDM5TDE3IDM2TDE5IDM2TDE5IDM3TDIxIDM3TDIxIDM4TDIyIDM4TDIyIDM3TDIxIDM3TDIxIDM1TDIwIDM1TDIwIDM0TDIxIDM0TDIxIDMyTDE5IDMyTDE5IDMxTDE4IDMxTDE4IDMwTDE3IDMwTDE3IDI5TDE2IDI5TDE2IDI3TDE3IDI3TDE3IDI2TDE2IDI2TDE2IDI1TDE4IDI1TDE4IDI3TDIwIDI3TDIwIDI1TDIxIDI1TDIxIDI0TDI0IDI0TDI0IDIzTDIzIDIzTDIzIDIyTDI1IDIyTDI1IDE4TDI2IDE4TDI2IDE5TDI3IDE5TDI3IDIwTDI2IDIwTDI2IDIyTDI3IDIyTDI3IDIwTDMwIDIwTDMwIDE5TDI5IDE5TDI5IDE4TDMwIDE4TDMwIDE3TDMyIDE3TDMyIDE1TDMxIDE1TDMxIDE0TDMyIDE0TDMyIDEzTDMzIDEzTDMzIDEyTDMwIDEyTDMwIDE1TDI3IDE1TDI3IDE2TDI2IDE2TDI2IDE3TDI1IDE3TDI1IDE0TDI3IDE0TDI3IDEzTDI4IDEzTDI4IDE0TDI5IDE0TDI5IDExTDI4IDExTDI4IDEyTDI3IDEyTDI3IDEzTDI1IDEzTDI1IDE0TDI0IDE0TDI0IDEyTDIzIDEyTDIzIDhMMjIgOEwyMiA3TDIxIDdMMjEgOUwyMCA5TDIwIDEwTDE5IDEwTDE5IDlMMTggOUwxOCAxMUwxNyAxMUwxNyAxMEwxNiAxMEwxNiA5TDE1IDlMMTUgOEwxNCA4TDE0IDdaTTE0IDlMMTQgMTBMMTUgMTBMMTUgMTFMMTQgMTFMMTQgMTJMMTMgMTJMMTMgMTNMMTQgMTNMMTQgMTRMMTYgMTRMMTYgMTVMMTQgMTVMMTQgMTZMMTMgMTZMMTMgMTdMMTQgMTdMMTQgMTZMMTYgMTZMMTYgMTdMMTkgMTdMMTkgMThMMTggMThMMTggMTlMMjAgMTlMMjAgMjBMMjIgMjBMMjIgMjFMMjMgMjFMMjMgMjBMMjQgMjBMMjQgMTdMMjMgMTdMMjMgMThMMjIgMThMMjIgMTZMMjEgMTZMMjEgMTVMMjMgMTVMMjMgMTZMMjQgMTZMMjQgMTRMMjEgMTRMMjEgMTJMMjAgMTJMMjAgMTFMMTggMTFMMTggMTJMMTcgMTJMMTcgMTFMMTYgMTFMMTYgMTBMMTUgMTBMMTUgOVpNMjEgOUwyMSAxMEwyMiAxMEwyMiA5Wk0zOSA5TDM5IDEwTDM4IDEwTDM4IDExTDM3IDExTDM3IDEwTDM2IDEwTDM2IDEyTDM1IDEyTDM1IDEzTDM2IDEzTDM2IDEyTDM4IDEyTDM4IDEzTDM3IDEzTDM3IDE0TDM1IDE0TDM1IDE3TDM2IDE3TDM2IDE4TDM1IDE4TDM1IDE5TDM0IDE5TDM0IDIwTDM1IDIwTDM1IDE5TDM2IDE5TDM2IDIxTDM1IDIxTDM1IDIzTDM3IDIzTDM3IDIyTDQxIDIyTDQxIDI0TDQwIDI0TDQwIDIzTDM4IDIzTDM4IDI1TDQyIDI1TDQyIDIzTDQzIDIzTDQzIDI1TDQ0IDI1TDQ0IDI2TDQ1IDI2TDQ1IDI1TDQ0IDI1TDQ0IDIyTDQxIDIyTDQxIDIxTDQzIDIxTDQzIDIwTDQ0IDIwTDQ0IDIxTDQ1IDIxTDQ1IDIyTDQ2IDIyTDQ2IDIxTDQ1IDIxTDQ1IDIwTDQ0IDIwTDQ0IDE5TDQzIDE5TDQzIDE4TDQyIDE4TDQyIDIwTDM5IDIwTDM5IDE5TDQwIDE5TDQwIDE3TDM4IDE3TDM4IDE2TDM5IDE2TDM5IDE1TDQwIDE1TDQwIDE0TDQxIDE0TDQxIDEyTDQyIDEyTDQyIDEwTDQxIDEwTDQxIDEyTDQwIDEyTDQwIDExTDM5IDExTDM5IDEwTDQwIDEwTDQwIDlaTTU4IDlMNTggMTBMNTkgMTBMNTkgOVpNMyAxMUwzIDE0TDQgMTRMNCAxMVpNMTUgMTFMMTUgMTNMMTYgMTNMMTYgMTRMMTcgMTRMMTcgMTZMMTggMTZMMTggMTRMMTkgMTRMMTkgMTZMMjAgMTZMMjAgMTJMMTggMTJMMTggMTNMMTcgMTNMMTcgMTJMMTYgMTJMMTYgMTFaTTU4IDExTDU4IDEyTDU5IDEyTDU5IDExWk0xIDEyTDEgMTNMMiAxM0wyIDEyWk02IDEyTDYgMTNMNyAxM0w3IDEyWk0zOSAxMkwzOSAxNEwzOCAxNEwzOCAxNUwzNiAxNUwzNiAxNkwzOCAxNkwzOCAxNUwzOSAxNUwzOSAxNEw0MCAxNEw0MCAxMlpNNDUgMTJMNDUgMTNMNDYgMTNMNDYgMTRMNDggMTRMNDggMTNMNDYgMTNMNDYgMTJaTTU3IDEzTDU3IDE0TDU4IDE0TDU4IDE1TDU5IDE1TDU5IDE3TDYwIDE3TDYwIDE1TDU5IDE1TDU5IDE0TDU4IDE0TDU4IDEzWk0yIDE1TDIgMTZMNCAxNkw0IDE1Wk0zMCAxNUwzMCAxNkwzMSAxNkwzMSAxNVpNNDMgMTVMNDMgMTZMNDQgMTZMNDQgMTVaTTggMTZMOCAxN0w5IDE3TDkgMTZaTTI3IDE2TDI3IDE3TDI5IDE3TDI5IDE2Wk00NSAxNkw0NSAxN0w0OSAxN0w0OSAxOEw0NyAxOEw0NyAxOUw1MCAxOUw1MCAxN0w0OSAxN0w0OSAxNlpNMjAgMThMMjAgMTlMMjEgMTlMMjEgMThaTTI3IDE4TDI3IDE5TDI4IDE5TDI4IDE4Wk0zNyAxOEwzNyAyMEwzOCAyMEwzOCAyMUwzOSAyMUwzOSAyMEwzOCAyMEwzOCAxOUwzOSAxOUwzOSAxOFpNMjIgMTlMMjIgMjBMMjMgMjBMMjMgMTlaTTMyIDIwTDMyIDIyTDMzIDIyTDMzIDIzTDMyIDIzTDMyIDI0TDMzIDI0TDMzIDI1TDMyIDI1TDMyIDI2TDMxIDI2TDMxIDI1TDI1IDI1TDI1IDI2TDI3IDI2TDI3IDI3TDI4IDI3TDI4IDI2TDMxIDI2TDMxIDI3TDI5IDI3TDI5IDI4TDMxIDI4TDMxIDI3TDMyIDI3TDMyIDI4TDMzIDI4TDMzIDMwTDM0IDMwTDM0IDMxTDM1IDMxTDM1IDMwTDM2IDMwTDM2IDMxTDM3IDMxTDM3IDI5TDM4IDI5TDM4IDI4TDM5IDI4TDM5IDI3TDQwIDI3TDQwIDI2TDM4IDI2TDM4IDI3TDM3IDI3TDM3IDI5TDM2IDI5TDM2IDI4TDMzIDI4TDMzIDI3TDM2IDI3TDM2IDI1TDM3IDI1TDM3IDI0TDM1IDI0TDM1IDI1TDM0IDI1TDM0IDI0TDMzIDI0TDMzIDIzTDM0IDIzTDM0IDIxTDMzIDIxTDMzIDIwWk00OCAyMEw0OCAyMUw1MCAyMUw1MCAyMFpNNjAgMjBMNjAgMjFMNjEgMjFMNjEgMjBaTTE5IDIxTDE5IDIyTDE4IDIyTDE4IDIzTDE5IDIzTDE5IDI0TDIxIDI0TDIxIDIzTDIyIDIzTDIyIDIyTDIxIDIyTDIxIDIzTDE5IDIzTDE5IDIyTDIwIDIyTDIwIDIxWk0xMiAyMkwxMiAyM0wxMyAyM0wxMyAyMlpNMTYgMjJMMTYgMjNMMTcgMjNMMTcgMjJaTTYwIDIyTDYwIDI0TDYxIDI0TDYxIDIyWk0xIDIzTDEgMjRMMiAyNEwyIDIzWk00IDI0TDQgMjVMNSAyNUw1IDI0Wk0xIDI1TDEgMjZMMCAyNkwwIDI4TDEgMjhMMSAyN0wzIDI3TDMgMjZMMiAyNkwyIDI1Wk05IDI1TDkgMjZMMTAgMjZMMTAgMjVaTTMzIDI1TDMzIDI2TDM0IDI2TDM0IDI1Wk0xNSAyNkwxNSAyN0wxNiAyN0wxNiAyNlpNNjAgMjhMNjAgMjlMNjEgMjlMNjEgMjhaTTAgMjlMMCAzMEwyIDMwTDIgMjlaTTUgMjlMNSAzMkw4IDMyTDggMjlaTTI5IDI5TDI5IDMyTDMyIDMyTDMyIDI5Wk01MyAyOUw1MyAzMkw1NiAzMkw1NiAyOVpNNiAzMEw2IDMxTDcgMzFMNyAzMFpNMjcgMzBMMjcgMzFMMjggMzFMMjggMzBaTTMwIDMwTDMwIDMxTDMxIDMxTDMxIDMwWk01NCAzMEw1NCAzMUw1NSAzMUw1NSAzMFpNMyAzMUwzIDMzTDQgMzNMNCAzMVpNOSAzMUw5IDMyTDExIDMyTDExIDMxWk00MyAzMUw0MyAzMkw0MiAzMkw0MiAzM0w0MyAzM0w0MyAzNEw0MCAzNEw0MCAzNUwzOSAzNUwzOSAzOUwzOCAzOUwzOCAzN0wzNyAzN0wzNyAzOUwzOCAzOUwzOCA0MEw0MCA0MEw0MCA0MUw0MSA0MUw0MSA0M0w0MyA0M0w0MyA0NEw0NCA0NEw0NCA0NUw0NSA0NUw0NSA0Nkw0NiA0Nkw0NiA0NUw0NSA0NUw0NSA0NEw0NCA0NEw0NCA0Mkw0NSA0Mkw0NSAzN0w0NCAzN0w0NCAzOEw0MSAzOEw0MSAzOUw0MCAzOUw0MCAzN0w0MSAzN0w0MSAzNUw0MiAzNUw0MiAzN0w0MyAzN0w0MyAzNEw0NCAzNEw0NCAzM0w0NSAzM0w0NSAzMkw0NCAzMkw0NCAzMVpNMzcgMzJMMzcgMzNMMzggMzNMMzggMzJaTTU3IDMyTDU3IDMzTDU4IDMzTDU4IDMyWk0xMCAzM0wxMCAzNEwxMiAzNEwxMiAzM1pNMjkgMzNMMjkgMzRMMzAgMzRMMzAgMzNaTTMxIDMzTDMxIDM0TDMyIDM0TDMyIDMzWk02IDM0TDYgMzVMNyAzNUw3IDM0Wk01MyAzNEw1MyAzNUw1NSAzNUw1NSAzNFpNMzUgMzVMMzUgMzZMMzYgMzZMMzYgMzVaTTExIDM3TDExIDM5TDEzIDM5TDEzIDM4TDEyIDM4TDEyIDM3Wk0xOCAzOEwxOCA0MEwyMCA0MEwyMCAzOUwxOSAzOUwxOSAzOFpNNDggMzhMNDggMzlMNDkgMzlMNDkgMzhaTTUwIDM4TDUwIDQwTDUxIDQwTDUxIDQxTDUyIDQxTDUyIDQwTDU0IDQwTDU0IDM5TDUxIDM5TDUxIDM4Wk01IDM5TDUgNDFMNCA0MUw0IDQyTDUgNDJMNSA0M0w0IDQzTDQgNDRMNSA0NEw1IDQ1TDcgNDVMNyA0NEw4IDQ0TDggNDNMNyA0M0w3IDQyTDYgNDJMNiA0MUw3IDQxTDcgNDBMNiA0MEw2IDM5Wk0yNyAzOUwyNyA0MEwyOSA0MEwyOSAzOVpNNDIgMzlMNDIgNDBMNDQgNDBMNDQgMzlaTTMyIDQxTDMyIDQyTDM0IDQyTDM0IDQzTDM1IDQzTDM1IDQyTDM0IDQyTDM0IDQxWk00MiA0MUw0MiA0Mkw0NCA0Mkw0NCA0MVpNNiA0M0w2IDQ0TDcgNDRMNyA0M1pNMTMgNDNMMTMgNDRMMTQgNDRMMTQgNDNaTTI2IDQzTDI2IDQ0TDI4IDQ0TDI4IDQzWk0zOSA0M0wzOSA0NUwzNyA0NUwzNyA0NkwzNSA0NkwzNSA0NUwzNCA0NUwzNCA0NkwzMyA0NkwzMyA0NUwzMiA0NUwzMiA0NEwzMSA0NEwzMSA0NkwzMCA0NkwzMCA0N0wzMiA0N0wzMiA0OEwzMyA0OEwzMyA0OUwzNCA0OUwzNCA1MEwzNSA1MEwzNSA1MUwzNyA1MUwzNyA1MEwzOCA1MEwzOCA0OEw0MCA0OEw0MCA0N0w0MyA0N0w0MyA1MEw0MiA1MEw0MiA0OEw0MSA0OEw0MSA1MEw0MiA1MEw0MiA1MUw0MyA1MUw0MyA1MEw0NCA1MEw0NCA0N0w0MyA0N0w0MyA0NkwzOSA0NkwzOSA0NUw0MiA0NUw0MiA0NEw0MCA0NEw0MCA0M1pNMTEgNDRMMTEgNDVMMTIgNDVMMTIgNDZMMTMgNDZMMTMgNDdMMTQgNDdMMTQgNDVMMTIgNDVMMTIgNDRaTTE2IDQ0TDE2IDQ1TDE3IDQ1TDE3IDQ2TDE2IDQ2TDE2IDQ4TDE4IDQ4TDE4IDQ5TDE5IDQ5TDE5IDQ3TDE4IDQ3TDE4IDQ1TDE3IDQ1TDE3IDQ0Wk01MiA0NEw1MiA0NUw1MyA0NUw1MyA0Nkw1NSA0Nkw1NSA0NUw1NCA0NUw1NCA0NFpNMjEgNDVMMjEgNDZMMjIgNDZMMjIgNDVaTTM0IDQ2TDM0IDQ3TDMzIDQ3TDMzIDQ4TDM0IDQ4TDM0IDQ5TDM2IDQ5TDM2IDUwTDM3IDUwTDM3IDQ5TDM2IDQ5TDM2IDQ4TDM3IDQ4TDM3IDQ3TDM4IDQ3TDM4IDQ2TDM3IDQ2TDM3IDQ3TDM2IDQ3TDM2IDQ4TDM0IDQ4TDM0IDQ3TDM1IDQ3TDM1IDQ2Wk00IDQ3TDQgNDhMNSA0OEw1IDQ5TDQgNDlMNCA1MEw1IDUwTDUgNDlMNiA0OUw2IDUwTDcgNTBMNyA0OUw2IDQ5TDYgNDhMNyA0OEw3IDQ3TDYgNDdMNiA0OEw1IDQ4TDUgNDdaTTIxIDQ3TDIxIDQ4TDIyIDQ4TDIyIDQ5TDIwIDQ5TDIwIDUyTDIxIDUyTDIxIDUzTDIyIDUzTDIyIDUyTDIzIDUyTDIzIDQ3Wk01MiA0N0w1MiA0OEw1MyA0OEw1MyA0OUw1MiA0OUw1MiA1Mkw1MyA1Mkw1MyA1MEw1NCA1MEw1NCA0OEw1NSA0OEw1NSA1MUw1OCA1MUw1OCA1MEw2MCA1MEw2MCA0OUw1OSA0OUw1OSA0N0w1OCA0N0w1OCA0OEw1NyA0OEw1NyA0N0w1NiA0N0w1NiA0OEw1NSA0OEw1NSA0N1pNNDkgNDhMNDkgNDlMNTAgNDlMNTAgNDhaTTIgNDlMMiA1MEwzIDUwTDMgNDlaTTM5IDQ5TDM5IDUwTDQwIDUwTDQwIDQ5Wk0xOCA1MEwxOCA1MUwxNyA1MUwxNyA1M0wxNiA1M0wxNiA1MUwxNCA1MUwxNCA1NEwxNSA1NEwxNSA1NkwxNiA1NkwxNiA1NEwxOCA1NEwxOCA1MkwxOSA1MkwxOSA1MFpNMjYgNTBMMjYgNTFMMjcgNTFMMjcgNTJMMjkgNTJMMjkgNTBaTTMgNTFMMyA1Mkw0IDUyTDQgNTFaTTIxIDUxTDIxIDUyTDIyIDUyTDIyIDUxWk02IDUyTDYgNTNMNyA1M0w3IDUyWk04IDUyTDggNTRMOSA1NEw5IDUyWk0xNSA1M0wxNSA1NEwxNiA1NEwxNiA1M1pNMjkgNTNMMjkgNTZMMzIgNTZMMzIgNTNaTTUzIDUzTDUzIDU2TDU2IDU2TDU2IDUzWk0zMCA1NEwzMCA1NUwzMSA1NUwzMSA1NFpNNTQgNTRMNTQgNTVMNTUgNTVMNTUgNTRaTTU3IDU0TDU3IDU1TDU4IDU1TDU4IDU0Wk01OSA1NEw1OSA1NUw2MCA1NUw2MCA1NFpNOCA1NUw4IDU2TDkgNTZMOSA1NVpNMjQgNTZMMjQgNTdMMjMgNTdMMjMgNTlMMjQgNTlMMjQgNTdMMjUgNTdMMjUgNThMMjcgNThMMjcgNTdMMjUgNTdMMjUgNTZaTTQ4IDU2TDQ4IDU3TDQ5IDU3TDQ5IDU2Wk0xMSA1N0wxMSA1OEwxMiA1OEwxMiA1N1pNNDAgNThMNDAgNTlMNDEgNTlMNDEgNjBMNDIgNjBMNDIgNTlMNDEgNTlMNDEgNThaTTAgMEwwIDdMNyA3TDcgMFpNMSAxTDEgNkw2IDZMNiAxWk0yIDJMMiA1TDUgNUw1IDJaTTU0IDBMNTQgN0w2MSA3TDYxIDBaTTU1IDFMNTUgNkw2MCA2TDYwIDFaTTU2IDJMNTYgNUw1OSA1TDU5IDJaTTAgNTRMMCA2MUw3IDYxTDcgNTRaTTEgNTVMMSA2MEw2IDYwTDYgNTVaTTIgNTZMMiA1OUw1IDU5TDUgNTZaIiBmaWxsPSIjMDAwMDAwIi8+PC9nPjwvZz48L3N2Zz4K	data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyIgPz4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+DQo8c3ZnIHdpZHRoPSIyMzciIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCAyMzcgODAiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCgk8ZGVzYz4wMDAwMDAwNDwvZGVzYz4NCgk8ZyBpZD0iYmFycyIgZmlsbD0icmdiKDAsMCwwKSIgc3Ryb2tlPSJub25lIj4NCgkJPHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjYiIGhlaWdodD0iODAiIC8+DQoJCTxyZWN0IHg9IjkiIHk9IjAiIHdpZHRoPSIzIiBoZWlnaHQ9IjgwIiAvPg0KCQk8cmVjdCB4PSIxOCIgeT0iMCIgd2lkdGg9IjkiIGhlaWdodD0iODAiIC8+DQoJCTxyZWN0IHg9IjMzIiB5PSIwIiB3aWR0aD0iNiIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iNDIiIHk9IjAiIHdpZHRoPSI2IiBoZWlnaHQ9IjgwIiAvPg0KCQk8cmVjdCB4PSI1NCIgeT0iMCIgd2lkdGg9IjYiIGhlaWdodD0iODAiIC8+DQoJCTxyZWN0IHg9IjY2IiB5PSIwIiB3aWR0aD0iNiIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iNzUiIHk9IjAiIHdpZHRoPSI2IiBoZWlnaHQ9IjgwIiAvPg0KCQk8cmVjdCB4PSI4NyIgeT0iMCIgd2lkdGg9IjYiIGhlaWdodD0iODAiIC8+DQoJCTxyZWN0IHg9Ijk5IiB5PSIwIiB3aWR0aD0iNiIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMTA4IiB5PSIwIiB3aWR0aD0iNiIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMTIwIiB5PSIwIiB3aWR0aD0iNiIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMTMyIiB5PSIwIiB3aWR0aD0iMyIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMTQxIiB5PSIwIiB3aWR0aD0iMyIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMTUzIiB5PSIwIiB3aWR0aD0iNiIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMTY1IiB5PSIwIiB3aWR0aD0iNiIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMTc3IiB5PSIwIiB3aWR0aD0iOSIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMTkyIiB5PSIwIiB3aWR0aD0iMyIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMTk4IiB5PSIwIiB3aWR0aD0iNiIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMjEzIiB5PSIwIiB3aWR0aD0iOSIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMjI1IiB5PSIwIiB3aWR0aD0iMyIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMjMxIiB5PSIwIiB3aWR0aD0iNiIgaGVpZ2h0PSI4MCIgLz4NCgk8L2c+DQo8L3N2Zz4NCg==
8	MSI pro	2	MSI pro	234432	9172.6	2313214121	2023-07-18	18000	2025-07-18	5	1	5	\N	3	2025-12-18 05:44:22	2025-12-29 01:50:26	data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZlcnNpb249IjEuMSIgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIHZpZXdCb3g9IjAgMCAzMDAgMzAwIj48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2ZmZmZmZiIvPjxnIHRyYW5zZm9ybT0ic2NhbGUoMy4yMjYpIj48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgwLDApIj48cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik04IDBMOCAzTDkgM0w5IDRMMTAgNEwxMCA3TDkgN0w5IDVMOCA1TDggOUwxMSA5TDExIDEwTDEwIDEwTDEwIDEyTDEzIDEyTDEzIDExTDE0IDExTDE0IDE1TDEzIDE1TDEzIDE0TDEyIDE0TDEyIDE1TDEzIDE1TDEzIDE2TDEyIDE2TDEyIDE3TDEwIDE3TDEwIDE2TDExIDE2TDExIDE1TDkgMTVMOSAxNEwxMCAxNEwxMCAxM0w5IDEzTDkgMTJMOCAxMkw4IDExTDkgMTFMOSAxMEw4IDEwTDggMTFMNyAxMUw3IDEwTDYgMTBMNiA5TDcgOUw3IDhMNiA4TDYgOUw1IDlMNSA4TDIgOEwyIDlMMCA5TDAgMTBMMSAxMEwxIDExTDAgMTFMMCAxNUwxIDE1TDEgMTRMMyAxNEwzIDE1TDIgMTVMMiAxNkwwIDE2TDAgMThMMSAxOEwxIDE3TDIgMTdMMiAxOEwzIDE4TDMgMjBMNSAyMEw1IDE4TDYgMThMNiAxOUw3IDE5TDcgMThMOCAxOEw4IDE3TDkgMTdMOSAxOEwxMCAxOEwxMCAyMEw5IDIwTDkgMTlMOCAxOUw4IDIxTDcgMjFMNyAyMEw2IDIwTDYgMjFMNSAyMUw1IDI0TDYgMjRMNiAyNUw1IDI1TDUgMjdMNyAyN0w3IDI2TDggMjZMOCAyOEwyIDI4TDIgMzBMMSAzMEwxIDI5TDAgMjlMMCAzMEwxIDMwTDEgMzFMMCAzMUwwIDMyTDIgMzJMMiAzM0wwIDMzTDAgMzVMMSAzNUwxIDM0TDIgMzRMMiAzNUwzIDM1TDMgMzFMNCAzMUw0IDMzTDUgMzNMNSAzNEw0IDM0TDQgMzdMMiAzN0wyIDM2TDEgMzZMMSAzN0wwIDM3TDAgMzlMMSAzOUwxIDQwTDIgNDBMMiA0MUwwIDQxTDAgNDJMMSA0MkwxIDQ0TDIgNDRMMiA0MUwzIDQxTDMgNDRMNSA0NEw1IDQ2TDYgNDZMNiA0N0w0IDQ3TDQgNDZMMyA0NkwzIDQ3TDQgNDdMNCA0OEw1IDQ4TDUgNDlMNyA0OUw3IDQ4TDggNDhMOCA0OUw5IDQ5TDkgNDhMOCA0OEw4IDQ3TDkgNDdMOSA0NEwxMCA0NEwxMCA0NUwxMSA0NUwxMSA0NEwxMCA0NEwxMCA0M0wxMiA0M0wxMiA0MEwxMyA0MEwxMyAzOUwxNCAzOUwxNCAzOEwxMyAzOEwxMyAzNkwxNCAzNkwxNCAzN0wxNSAzN0wxNSAzNEwxMyAzNEwxMyAzM0wxNSAzM0wxNSAzMkwxNyAzMkwxNyAzMUwxNiAzMUwxNiAzMEwxNyAzMEwxNyAyOEwxNiAyOEwxNiAyOUwxNCAyOUwxNCAyN0wxMiAyN0wxMiAyNEw5IDI0TDkgMjZMOCAyNkw4IDIzTDkgMjNMOSAyMkw4IDIyTDggMjFMMTAgMjFMMTAgMjBMMTMgMjBMMTMgMThMMTQgMThMMTQgMTlMMTUgMTlMMTUgMThMMTYgMThMMTYgMTlMMTcgMTlMMTcgMThMMTggMThMMTggMjBMMjAgMjBMMjAgMTlMMTkgMTlMMTkgMThMMjEgMThMMjEgMTlMMjIgMTlMMjIgMjFMMjEgMjFMMjEgMjJMMjAgMjJMMjAgMjNMMTkgMjNMMTkgMjFMMTggMjFMMTggMjNMMTkgMjNMMTkgMjRMMTcgMjRMMTcgMjZMMTggMjZMMTggMjdMMTkgMjdMMTkgMjZMMjIgMjZMMjIgMjVMMTkgMjVMMTkgMjRMMjMgMjRMMjMgMjNMMjEgMjNMMjEgMjJMMjIgMjJMMjIgMjFMMjMgMjFMMjMgMjJMMjQgMjJMMjQgMjVMMjMgMjVMMjMgMjdMMjQgMjdMMjQgMjhMMjUgMjhMMjUgMjlMMjQgMjlMMjQgMzBMMjMgMzBMMjMgMjlMMjIgMjlMMjIgMzFMMjQgMzFMMjQgMzJMMjMgMzJMMjMgMzRMMjIgMzRMMjIgMzNMMjEgMzNMMjEgMjhMMjIgMjhMMjIgMjdMMjEgMjdMMjEgMjhMMTggMjhMMTggMjlMMTkgMjlMMTkgMzBMMjAgMzBMMjAgMzFMMTkgMzFMMTkgMzJMMjAgMzJMMjAgMzNMMTcgMzNMMTcgMzRMMTYgMzRMMTYgMzVMMTggMzVMMTggMzRMMjAgMzRMMjAgMzZMMjMgMzZMMjMgMzVMMjQgMzVMMjQgMzdMMjIgMzdMMjIgMzhMMjQgMzhMMjQgMzlMMjIgMzlMMjIgNDBMMTkgNDBMMTkgMzlMMjAgMzlMMjAgMzdMMTkgMzdMMTkgMzZMMTggMzZMMTggMzdMMTcgMzdMMTcgMzZMMTYgMzZMMTYgMzdMMTcgMzdMMTcgMzhMMTUgMzhMMTUgMzlMMTYgMzlMMTYgNDFMMTMgNDFMMTMgNDJMMTYgNDJMMTYgNDNMMTkgNDNMMTkgNDRMMTcgNDRMMTcgNDVMMTggNDVMMTggNDdMMTkgNDdMMTkgNDhMMTcgNDhMMTcgNDdMMTYgNDdMMTYgNDZMMTUgNDZMMTUgNDVMMTQgNDVMMTQgNDRMMTUgNDRMMTUgNDNMMTQgNDNMMTQgNDRMMTMgNDRMMTMgNDVMMTIgNDVMMTIgNDZMMTAgNDZMMTAgNDhMMTEgNDhMMTEgNDlMMTUgNDlMMTUgNDhMMTYgNDhMMTYgNDlMMTcgNDlMMTcgNTBMMTYgNTBMMTYgNTFMMTUgNTFMMTUgNTBMNSA1MEw1IDUxTDQgNTFMNCA0OUwzIDQ5TDMgNDhMMiA0OEwyIDQ3TDEgNDdMMSA0NkwyIDQ2TDIgNDVMMCA0NUwwIDQ3TDEgNDdMMSA0OEwwIDQ4TDAgNTFMMSA1MUwxIDUyTDIgNTJMMiA1NEwxIDU0TDEgNTNMMCA1M0wwIDU0TDEgNTRMMSA1NUwwIDU1TDAgNTZMMSA1NkwxIDU4TDAgNThMMCA2MEwxIDYwTDEgNTlMMyA1OUwzIDU4TDQgNThMNCA2MUwzIDYxTDMgNjJMMiA2MkwyIDYxTDAgNjFMMCA2M0wxIDYzTDEgNjRMMyA2NEwzIDY1TDIgNjVMMiA2NkwxIDY2TDEgNjVMMCA2NUwwIDY2TDEgNjZMMSA2N0wzIDY3TDMgNjhMMSA2OEwxIDY5TDAgNjlMMCA3MEwxIDcwTDEgNjlMMyA2OUwzIDcwTDIgNzBMMiA3MkwxIDcyTDEgNzNMMCA3M0wwIDc0TDEgNzRMMSA3M0wyIDczTDIgNzRMMyA3NEwzIDgwTDAgODBMMCA4MkwxIDgyTDEgODFMMiA4MUwyIDgyTDMgODJMMyA4MEw0IDgwTDQgODNMMyA4M0wzIDg0TDIgODRMMiA4M0wwIDgzTDAgODRMMSA4NEwxIDg1TDMgODVMMyA4NEw2IDg0TDYgODVMNyA4NUw3IDg0TDggODRMOCA4Nkw5IDg2TDkgODVMMTEgODVMMTEgODZMMTIgODZMMTIgODVMMTEgODVMMTEgODRMMTMgODRMMTMgODVMMTQgODVMMTQgODhMMTUgODhMMTUgODlMMTMgODlMMTMgOTFMMTAgOTFMMTAgOTNMMTEgOTNMMTEgOTJMMTQgOTJMMTQgOTNMMTUgOTNMMTUgOTJMMTQgOTJMMTQgOTFMMTUgOTFMMTUgODlMMTYgODlMMTYgODhMMTUgODhMMTUgODdMMTYgODdMMTYgODZMMTggODZMMTggODVMMTkgODVMMTkgODJMMTggODJMMTggODNMMTcgODNMMTcgODRMMTggODRMMTggODVMMTYgODVMMTYgODRMMTMgODRMMTMgODNMMTYgODNMMTYgODJMMTcgODJMMTcgODFMMTggODFMMTggNzhMMTkgNzhMMTkgNzlMMjAgNzlMMjAgODFMMjEgODFMMjEgODBMMjIgODBMMjIgODJMMjQgODJMMjQgODNMMjUgODNMMjUgODFMMjcgODFMMjcgODJMMjYgODJMMjYgODNMMjcgODNMMjcgODRMMjQgODRMMjQgODZMMjMgODZMMjMgODNMMjIgODNMMjIgODRMMjAgODRMMjAgODVMMjIgODVMMjIgODZMMjAgODZMMjAgODdMMjIgODdMMjIgODhMMjEgODhMMjEgODlMMjAgODlMMjAgODhMMTkgODhMMTkgODlMMjAgODlMMjAgOTNMMjEgOTNMMjEgOTBMMjMgOTBMMjMgOTFMMjIgOTFMMjIgOTJMMjMgOTJMMjMgOTNMMjQgOTNMMjQgOTBMMjMgOTBMMjMgODlMMjUgODlMMjUgOTBMMjYgOTBMMjYgOTFMMjUgOTFMMjUgOTNMMjYgOTNMMjYgOTFMMjkgOTFMMjkgOTJMMjcgOTJMMjcgOTNMMzMgOTNMMzMgOTJMMzQgOTJMMzQgOTNMMzcgOTNMMzcgOTFMMzYgOTFMMzYgODlMMzQgODlMMzQgODdMMzMgODdMMzMgODNMMzUgODNMMzUgODRMMzQgODRMMzQgODVMMzUgODVMMzUgODdMMzYgODdMMzYgODhMMzggODhMMzggODlMMzkgODlMMzkgOTJMMzggOTJMMzggOTNMMzkgOTNMMzkgOTJMNDEgOTJMNDEgOTNMNDQgOTNMNDQgOTFMNDUgOTFMNDUgOTNMNDYgOTNMNDYgOTFMNDcgOTFMNDcgOTNMNDkgOTNMNDkgOTJMNTAgOTJMNTAgOTNMNTEgOTNMNTEgOTFMNDkgOTFMNDkgOTBMNTAgOTBMNTAgODlMNDkgODlMNDkgOTBMNDYgOTBMNDYgODlMNDcgODlMNDcgODZMNDkgODZMNDkgODhMNTAgODhMNTAgODdMNTIgODdMNTIgODZMNTMgODZMNTMgODhMNTQgODhMNTQgOTBMNTUgOTBMNTUgODlMNTggODlMNTggOTBMNTYgOTBMNTYgOTJMNTcgOTJMNTcgOTFMNTggOTFMNTggOTBMNTkgOTBMNTkgOTFMNjAgOTFMNjAgOTJMNTkgOTJMNTkgOTNMNjcgOTNMNjcgOTJMNjggOTJMNjggOTNMNzEgOTNMNzEgOTJMNzMgOTJMNzMgOTFMNzQgOTFMNzQgOTNMNzYgOTNMNzYgOTJMNzcgOTJMNzcgOTFMNzkgOTFMNzkgOTJMODAgOTJMODAgOTBMNzkgOTBMNzkgODhMODAgODhMODAgODdMODEgODdMODEgOTFMODMgOTFMODMgOTBMODIgOTBMODIgODZMODMgODZMODMgODVMODQgODVMODQgODdMODMgODdMODMgODhMODQgODhMODQgOTJMODIgOTJMODIgOTNMODUgOTNMODUgOTFMODcgOTFMODcgOTJMODggOTJMODggOTFMODcgOTFMODcgOTBMODkgOTBMODkgODlMOTAgODlMOTAgOTFMODkgOTFMODkgOTJMOTAgOTJMOTAgOTNMOTIgOTNMOTIgOTJMOTEgOTJMOTEgODlMOTAgODlMOTAgODhMOTIgODhMOTIgODlMOTMgODlMOTMgODhMOTIgODhMOTIgODZMOTEgODZMOTEgODRMOTMgODRMOTMgODNMOTIgODNMOTIgODJMOTMgODJMOTMgODFMOTIgODFMOTIgNzhMOTMgNzhMOTMgNzdMOTEgNzdMOTEgNzhMODkgNzhMODkgODBMODggODBMODggNzlMODcgNzlMODcgODJMODggODJMODggODFMODkgODFMODkgODBMOTEgODBMOTEgODFMOTIgODFMOTIgODJMOTAgODJMOTAgODVMODkgODVMODkgODNMODcgODNMODcgODRMODYgODRMODYgODFMODUgODFMODUgODBMODYgODBMODYgNzlMODUgNzlMODUgNzhMODcgNzhMODcgNzdMOTAgNzdMOTAgNzZMOTEgNzZMOTEgNzVMOTIgNzVMOTIgNzRMOTMgNzRMOTMgNzNMOTAgNzNMOTAgNzJMOTEgNzJMOTEgNzFMOTIgNzFMOTIgNzBMOTEgNzBMOTEgNjlMOTIgNjlMOTIgNjZMOTMgNjZMOTMgNjVMOTAgNjVMOTAgNjdMODkgNjdMODkgNjZMODggNjZMODggNjVMODkgNjVMODkgNjRMOTEgNjRMOTEgNjJMOTMgNjJMOTMgNjFMOTEgNjFMOTEgNjJMOTAgNjJMOTAgNjFMODkgNjFMODkgNjBMOTEgNjBMOTEgNTlMOTIgNTlMOTIgNjBMOTMgNjBMOTMgNTlMOTIgNTlMOTIgNThMOTMgNThMOTMgNTVMOTIgNTVMOTIgNTRMOTEgNTRMOTEgNTNMOTAgNTNMOTAgNTRMOTEgNTRMOTEgNTVMOTAgNTVMOTAgNTZMODkgNTZMODkgNTJMOTEgNTJMOTEgNTFMOTIgNTFMOTIgNTNMOTMgNTNMOTMgNTFMOTIgNTFMOTIgNDlMOTMgNDlMOTMgNDdMOTIgNDdMOTIgNDlMOTAgNDlMOTAgNTBMOTEgNTBMOTEgNTFMODkgNTFMODkgNTJMODggNTJMODggNTBMODcgNTBMODcgNTJMODggNTJMODggNTNMODQgNTNMODQgNTRMODYgNTRMODYgNTVMODMgNTVMODMgNTZMODIgNTZMODIgNTVMODEgNTVMODEgNTRMODIgNTRMODIgNTNMODEgNTNMODEgNTFMNzkgNTFMNzkgNTBMNzYgNTBMNzYgNDhMNzcgNDhMNzcgNDdMNzggNDdMNzggNDhMODAgNDhMODAgNDlMODEgNDlMODEgNTBMODMgNTBMODMgNDlMODEgNDlMODEgNDhMODIgNDhMODIgNDdMODEgNDdMODEgNDZMODIgNDZMODIgNDVMODQgNDVMODQgNDZMODMgNDZMODMgNDdMODQgNDdMODQgNTBMODUgNTBMODUgNDlMODcgNDlMODcgNDhMODggNDhMODggNDdMODkgNDdMODkgNDhMOTEgNDhMOTEgNDVMODggNDVMODggNDRMOTIgNDRMOTIgNDJMOTMgNDJMOTMgNDFMOTIgNDFMOTIgNDBMOTEgNDBMOTEgMzlMOTIgMzlMOTIgMzhMOTMgMzhMOTMgMzdMOTIgMzdMOTIgMzhMOTEgMzhMOTEgMzdMOTAgMzdMOTAgMzZMOTIgMzZMOTIgMzVMOTEgMzVMOTEgMzRMOTMgMzRMOTMgMzNMOTIgMzNMOTIgMzJMOTEgMzJMOTEgMzFMOTIgMzFMOTIgMzBMOTMgMzBMOTMgMjdMOTIgMjdMOTIgMzBMOTEgMzBMOTEgMjNMOTIgMjNMOTIgMjFMOTMgMjFMOTMgMjBMOTIgMjBMOTIgMThMOTMgMThMOTMgMTdMODkgMTdMODkgMTZMODggMTZMODggMTVMODkgMTVMODkgMTJMOTEgMTJMOTEgMTNMOTAgMTNMOTAgMTZMOTEgMTZMOTEgMTVMOTIgMTVMOTIgMTZMOTMgMTZMOTMgMTVMOTIgMTVMOTIgMTRMOTMgMTRMOTMgMTNMOTIgMTNMOTIgMTJMOTMgMTJMOTMgMTFMOTIgMTFMOTIgMTBMOTMgMTBMOTMgOEw5MCA4TDkwIDlMODggOUw4OCA4TDg1IDhMODUgNkw4NCA2TDg0IDNMODUgM0w4NSAxTDg0IDFMODQgMEw4MyAwTDgzIDJMODQgMkw4NCAzTDgzIDNMODMgNEw4MiA0TDgyIDNMODEgM0w4MSAyTDgwIDJMODAgMEw3OCAwTDc4IDFMNzkgMUw3OSAyTDc4IDJMNzggM0w4MCAzTDgwIDRMNzggNEw3OCA1TDc3IDVMNzcgNkw3NiA2TDc2IDNMNzUgM0w3NSA2TDc0IDZMNzQgNUw3MyA1TDczIDJMNzEgMkw3MSAxTDcwIDFMNzAgMEw2OSAwTDY5IDFMNzAgMUw3MCAyTDY5IDJMNjkgM0w2OCAzTDY4IDFMNjMgMUw2MyAzTDYyIDNMNjIgNUw2MSA1TDYxIDNMNjAgM0w2MCA0TDU5IDRMNTkgMkw2MSAyTDYxIDBMNTkgMEw1OSAyTDU4IDJMNTggMEw1NyAwTDU3IDFMNTUgMUw1NSAwTDU0IDBMNTQgMUw1MyAxTDUzIDBMNTEgMEw1MSAyTDQ4IDJMNDggMUw0OSAxTDQ5IDBMNDggMEw0OCAxTDQ2IDFMNDYgMEw0MyAwTDQzIDFMNDUgMUw0NSAyTDQ2IDJMNDYgM0w0MyAzTDQzIDRMNDYgNEw0NiAzTDQ3IDNMNDcgNEw0OCA0TDQ4IDdMNDcgN0w0NyA2TDQ2IDZMNDYgN0w0NSA3TDQ1IDVMNDMgNUw0MyA2TDQyIDZMNDIgOEw0MSA4TDQxIDVMNDIgNUw0MiA0TDQwIDRMNDAgMkw0MiAyTDQyIDFMMzkgMUwzOSAwTDM4IDBMMzggMUwzNyAxTDM3IDBMMzYgMEwzNiAxTDM1IDFMMzUgMkwzNCAyTDM0IDNMMzEgM0wzMSA0TDI5IDRMMjkgMUwzMiAxTDMyIDJMMzMgMkwzMyAxTDM0IDFMMzQgMEwzMyAwTDMzIDFMMzIgMUwzMiAwTDI5IDBMMjkgMUwyNyAxTDI3IDBMMjYgMEwyNiAxTDI3IDFMMjcgMkwyNiAyTDI2IDNMMjUgM0wyNSAxTDIzIDFMMjMgMkwyMSAyTDIxIDVMMjAgNUwyMCAzTDE5IDNMMTkgMUwyMCAxTDIwIDBMMTkgMEwxOSAxTDE4IDFMMTggM0wxNyAzTDE3IDBMMTUgMEwxNSAxTDE0IDFMMTQgMEwxMiAwTDEyIDJMMTEgMkwxMSAxTDEwIDFMMTAgMFpNMjEgMEwyMSAxTDIyIDFMMjIgMFpNNzIgMEw3MiAxTDczIDFMNzMgMFpNNzUgMEw3NSAxTDc0IDFMNzQgMkw3NyAyTDc3IDFMNzYgMUw3NiAwWk04MSAwTDgxIDFMODIgMUw4MiAwWk0xNSAxTDE1IDJMMTYgMkwxNiAxWk0zOCAxTDM4IDJMMzYgMkwzNiAzTDM1IDNMMzUgNEwzNiA0TDM2IDNMMzcgM0wzNyA3TDM2IDdMMzYgNkwzNSA2TDM1IDVMMzQgNUwzNCA0TDMzIDRMMzMgNUwzNCA1TDM0IDZMMzMgNkwzMyA3TDM0IDdMMzQgNkwzNSA2TDM1IDhMMzQgOEwzNCAxMUwzMyAxMUwzMyAxMEwyOSAxMEwyOSA5TDI4IDlMMjggOEwyNyA4TDI3IDdMMjggN0wyOCA1TDI3IDVMMjcgNEwyOCA0TDI4IDNMMjYgM0wyNiA2TDI1IDZMMjUgN0wyNCA3TDI0IDVMMjUgNUwyNSA0TDIzIDRMMjMgN0wyMiA3TDIyIDVMMjEgNUwyMSA4TDIwIDhMMjAgNUwxOSA1TDE5IDRMMTggNEwxOCA2TDE3IDZMMTcgOEwxNCA4TDE0IDZMMTUgNkwxNSA3TDE2IDdMMTYgNkwxNSA2TDE1IDVMMTYgNUwxNiA0TDE3IDRMMTcgM0wxNCAzTDE0IDJMMTIgMkwxMiAzTDEzIDNMMTMgNEwxNSA0TDE1IDVMMTQgNUwxNCA2TDEzIDZMMTMgNUwxMiA1TDEyIDRMMTEgNEwxMSA1TDEyIDVMMTIgNkwxMSA2TDExIDhMMTMgOEwxMyA5TDEyIDlMMTIgMTBMMTQgMTBMMTQgMTFMMTUgMTFMMTUgMTBMMTYgMTBMMTYgOUwxNyA5TDE3IDExTDE2IDExTDE2IDEyTDE1IDEyTDE1IDEzTDE3IDEzTDE3IDE1TDE4IDE1TDE4IDE2TDE2IDE2TDE2IDE4TDE3IDE4TDE3IDE3TDE4IDE3TDE4IDE4TDE5IDE4TDE5IDE3TDE4IDE3TDE4IDE2TDIxIDE2TDIxIDE1TDIyIDE1TDIyIDE0TDIzIDE0TDIzIDE1TDI0IDE1TDI0IDE2TDIyIDE2TDIyIDE3TDIxIDE3TDIxIDE4TDIyIDE4TDIyIDE5TDI0IDE5TDI0IDE3TDI1IDE3TDI1IDE2TDI2IDE2TDI2IDE0TDI4IDE0TDI4IDE1TDI5IDE1TDI5IDE2TDI4IDE2TDI4IDE3TDI5IDE3TDI5IDE4TDI3IDE4TDI3IDE3TDI2IDE3TDI2IDE4TDI1IDE4TDI1IDIwTDI0IDIwTDI0IDIyTDI1IDIyTDI1IDIxTDI3IDIxTDI3IDE5TDI4IDE5TDI4IDIzTDI3IDIzTDI3IDI0TDI1IDI0TDI1IDI1TDI4IDI1TDI4IDI0TDI5IDI0TDI5IDIxTDMwIDIxTDMwIDI0TDMxIDI0TDMxIDI1TDMyIDI1TDMyIDI0TDMzIDI0TDMzIDIyTDM0IDIyTDM0IDIxTDMzIDIxTDMzIDIyTDMyIDIyTDMyIDIzTDMxIDIzTDMxIDE5TDMyIDE5TDMyIDIwTDM1IDIwTDM1IDIzTDM0IDIzTDM0IDI0TDM1IDI0TDM1IDIzTDM2IDIzTDM2IDI0TDM3IDI0TDM3IDI1TDM5IDI1TDM5IDI2TDM2IDI2TDM2IDI1TDM1IDI1TDM1IDMwTDM0IDMwTDM0IDI4TDMzIDI4TDMzIDI2TDMxIDI2TDMxIDI4TDMzIDI4TDMzIDMwTDM0IDMwTDM0IDMxTDMzIDMxTDMzIDMyTDM0IDMyTDM0IDMxTDM1IDMxTDM1IDMwTDM2IDMwTDM2IDMxTDM5IDMxTDM5IDMyTDM4IDMyTDM4IDM0TDM3IDM0TDM3IDM1TDM4IDM1TDM4IDM2TDM5IDM2TDM5IDM1TDM4IDM1TDM4IDM0TDQwIDM0TDQwIDMzTDM5IDMzTDM5IDMyTDQxIDMyTDQxIDMwTDQyIDMwTDQyIDMxTDQ0IDMxTDQ0IDMzTDQxIDMzTDQxIDM1TDQyIDM1TDQyIDM2TDQwIDM2TDQwIDM3TDM5IDM3TDM5IDM4TDM4IDM4TDM4IDM5TDM3IDM5TDM3IDQwTDM4IDQwTDM4IDQxTDM3IDQxTDM3IDQ2TDM1IDQ2TDM1IDQ1TDM2IDQ1TDM2IDQ0TDM0IDQ0TDM0IDQzTDM2IDQzTDM2IDQxTDM1IDQxTDM1IDM5TDM2IDM5TDM2IDM4TDM1IDM4TDM1IDM5TDM0IDM5TDM0IDM2TDM1IDM2TDM1IDM0TDM2IDM0TDM2IDMzTDM3IDMzTDM3IDMyTDM2IDMyTDM2IDMzTDI5IDMzTDI5IDM1TDI4IDM1TDI4IDM0TDI3IDM0TDI3IDM2TDI2IDM2TDI2IDM0TDI1IDM0TDI1IDM3TDI2IDM3TDI2IDM4TDI3IDM4TDI3IDM5TDI2IDM5TDI2IDQwTDI1IDQwTDI1IDM5TDI0IDM5TDI0IDQwTDIzIDQwTDIzIDQxTDI0IDQxTDI0IDQyTDIzIDQyTDIzIDQ0TDIyIDQ0TDIyIDQxTDIxIDQxTDIxIDQzTDIwIDQzTDIwIDQ0TDIxIDQ0TDIxIDQ1TDE5IDQ1TDE5IDQ3TDIwIDQ3TDIwIDQ4TDE5IDQ4TDE5IDQ5TDE4IDQ5TDE4IDUwTDE3IDUwTDE3IDUxTDE4IDUxTDE4IDUzTDE3IDUzTDE3IDUyTDE2IDUyTDE2IDUzTDE3IDUzTDE3IDU1TDE2IDU1TDE2IDU0TDE0IDU0TDE0IDUzTDEyIDUzTDEyIDUyTDEzIDUyTDEzIDUxTDkgNTFMOSA1Mkw4IDUyTDggNTNMNSA1M0w1IDUyTDcgNTJMNyA1MUw1IDUxTDUgNTJMNCA1Mkw0IDU0TDggNTRMOCA1Nkw5IDU2TDkgNTdMMTAgNTdMMTAgNTZMMTEgNTZMMTEgNTRMMTQgNTRMMTQgNTZMMTMgNTZMMTMgNThMMTIgNThMMTIgNjBMMTMgNjBMMTMgNThMMTQgNThMMTQgNTlMMTUgNTlMMTUgNjBMMTQgNjBMMTQgNjJMMTMgNjJMMTMgNjNMMTEgNjNMMTEgNjJMMTAgNjJMMTAgNjFMMTEgNjFMMTEgNTlMOSA1OUw5IDYyTDEwIDYyTDEwIDYzTDkgNjNMOSA2NEw4IDY0TDggNjJMNyA2Mkw3IDYxTDUgNjFMNSA2Mkw3IDYyTDcgNjNMNiA2M0w2IDY0TDUgNjRMNSA2M0w0IDYzTDQgNjJMMyA2MkwzIDYzTDQgNjNMNCA2NEw1IDY0TDUgNjZMMyA2NkwzIDY3TDYgNjdMNiA2OEw3IDY4TDcgNjlMNSA2OUw1IDY4TDQgNjhMNCA2OUw1IDY5TDUgNzBMNCA3MEw0IDcxTDMgNzFMMyA3MkwyIDcyTDIgNzNMMyA3M0wzIDc0TDQgNzRMNCA3NUw2IDc1TDYgNzZMNSA3Nkw1IDc3TDQgNzdMNCA3OEw4IDc4TDggNzlMNCA3OUw0IDgwTDcgODBMNyA4MUw2IDgxTDYgODJMNSA4Mkw1IDgzTDYgODNMNiA4NEw3IDg0TDcgODNMNiA4M0w2IDgyTDcgODJMNyA4MUw4IDgxTDggODJMOSA4Mkw5IDg0TDEwIDg0TDEwIDgyTDEzIDgyTDEzIDgwTDE0IDgwTDE0IDgxTDE3IDgxTDE3IDgwTDE0IDgwTDE0IDc5TDEyIDc5TDEyIDc4TDEzIDc4TDEzIDc2TDEyIDc2TDEyIDc1TDE1IDc1TDE1IDc2TDE0IDc2TDE0IDc4TDE1IDc4TDE1IDc3TDE3IDc3TDE3IDc4TDE2IDc4TDE2IDc5TDE3IDc5TDE3IDc4TDE4IDc4TDE4IDc1TDE3IDc1TDE3IDc2TDE2IDc2TDE2IDczTDE3IDczTDE3IDc0TDE4IDc0TDE4IDczTDE5IDczTDE5IDc0TDIxIDc0TDIxIDcyTDIyIDcyTDIyIDcxTDIxIDcxTDIxIDY5TDIyIDY5TDIyIDY4TDI0IDY4TDI0IDY3TDI1IDY3TDI1IDY1TDI3IDY1TDI3IDY0TDI4IDY0TDI4IDY1TDI5IDY1TDI5IDY3TDI4IDY3TDI4IDY2TDI2IDY2TDI2IDY3TDI3IDY3TDI3IDY4TDI2IDY4TDI2IDcwTDI4IDcwTDI4IDcxTDMwIDcxTDMwIDczTDI4IDczTDI4IDcyTDI3IDcyTDI3IDczTDI2IDczTDI2IDcxTDI1IDcxTDI1IDY5TDI0IDY5TDI0IDcyTDIzIDcyTDIzIDc0TDIyIDc0TDIyIDc1TDIxIDc1TDIxIDc2TDIyIDc2TDIyIDc3TDIxIDc3TDIxIDc4TDIwIDc4TDIwIDc1TDE5IDc1TDE5IDc4TDIwIDc4TDIwIDc5TDIyIDc5TDIyIDgwTDI4IDgwTDI4IDc2TDI3IDc2TDI3IDczTDI4IDczTDI4IDc1TDMwIDc1TDMwIDc2TDI5IDc2TDI5IDc4TDMwIDc4TDMwIDc5TDMxIDc5TDMxIDc4TDMwIDc4TDMwIDc3TDMyIDc3TDMyIDc4TDMzIDc4TDMzIDc3TDM0IDc3TDM0IDc1TDMwIDc1TDMwIDc0TDMzIDc0TDMzIDcxTDMyIDcxTDMyIDcyTDMxIDcyTDMxIDcxTDMwIDcxTDMwIDcwTDI5IDcwTDI5IDY4TDMwIDY4TDMwIDY5TDMyIDY5TDMyIDY2TDMzIDY2TDMzIDY3TDM0IDY3TDM0IDY4TDM1IDY4TDM1IDcxTDM2IDcxTDM2IDczTDM0IDczTDM0IDc0TDM2IDc0TDM2IDc1TDM1IDc1TDM1IDc4TDM3IDc4TDM3IDc5TDM1IDc5TDM1IDgwTDM2IDgwTDM2IDgyTDM1IDgyTDM1IDgxTDM0IDgxTDM0IDgyTDM1IDgyTDM1IDgzTDM2IDgzTDM2IDgyTDM3IDgyTDM3IDgzTDM4IDgzTDM4IDgyTDM3IDgyTDM3IDgwTDM4IDgwTDM4IDc5TDM5IDc5TDM5IDc4TDM3IDc4TDM3IDc3TDM2IDc3TDM2IDc1TDM3IDc1TDM3IDc2TDM4IDc2TDM4IDc3TDM5IDc3TDM5IDc2TDQwIDc2TDQwIDc3TDQxIDc3TDQxIDc4TDQyIDc4TDQyIDc5TDQxIDc5TDQxIDgwTDQyIDgwTDQyIDgxTDQwIDgxTDQwIDgyTDM5IDgyTDM5IDgzTDQwIDgzTDQwIDg0TDM3IDg0TDM3IDg1TDM4IDg1TDM4IDg3TDM5IDg3TDM5IDg4TDQwIDg4TDQwIDg3TDM5IDg3TDM5IDg1TDQwIDg1TDQwIDg0TDQxIDg0TDQxIDg4TDQ0IDg4TDQ0IDg3TDQyIDg3TDQyIDg2TDQ0IDg2TDQ0IDg1TDQzIDg1TDQzIDg0TDQ0IDg0TDQ0IDgzTDQ1IDgzTDQ1IDg0TDQ2IDg0TDQ2IDg1TDQ1IDg1TDQ1IDg2TDQ2IDg2TDQ2IDg1TDQ3IDg1TDQ3IDgyTDQ4IDgyTDQ4IDg0TDQ5IDg0TDQ5IDgzTDUwIDgzTDUwIDg1TDUxIDg1TDUxIDg2TDUyIDg2TDUyIDg1TDUzIDg1TDUzIDg0TDUxIDg0TDUxIDgzTDUwIDgzTDUwIDgyTDUyIDgyTDUyIDgxTDUxIDgxTDUxIDgwTDUyIDgwTDUyIDc4TDUxIDc4TDUxIDc3TDUwIDc3TDUwIDc5TDUxIDc5TDUxIDgwTDQ5IDgwTDQ5IDc5TDQ3IDc5TDQ3IDgwTDQ2IDgwTDQ2IDgxTDQ1IDgxTDQ1IDc5TDQ2IDc5TDQ2IDc3TDQ3IDc3TDQ3IDc2TDQ2IDc2TDQ2IDc1TDQ1IDc1TDQ1IDc0TDQ2IDc0TDQ2IDczTDQ3IDczTDQ3IDcyTDQ4IDcyTDQ4IDcxTDQ3IDcxTDQ3IDY5TDQ4IDY5TDQ4IDY3TDUwIDY3TDUwIDY4TDQ5IDY4TDQ5IDcwTDUwIDcwTDUwIDY4TDUyIDY4TDUyIDY2TDUzIDY2TDUzIDY3TDU0IDY3TDU0IDY1TDU1IDY1TDU1IDY2TDU2IDY2TDU2IDY1TDU1IDY1TDU1IDY0TDU0IDY0TDU0IDYzTDU1IDYzTDU1IDYyTDUzIDYyTDUzIDYxTDU0IDYxTDU0IDYwTDU1IDYwTDU1IDYxTDU2IDYxTDU2IDYwTDU1IDYwTDU1IDU5TDU2IDU5TDU2IDU4TDU1IDU4TDU1IDU3TDU2IDU3TDU2IDU2TDU4IDU2TDU4IDU1TDU3IDU1TDU3IDU0TDU4IDU0TDU4IDUzTDU5IDUzTDU5IDUxTDYwIDUxTDYwIDUwTDYyIDUwTDYyIDUxTDYxIDUxTDYxIDUzTDYwIDUzTDYwIDU0TDU5IDU0TDU5IDU1TDYxIDU1TDYxIDU0TDYyIDU0TDYyIDUxTDYzIDUxTDYzIDUyTDY0IDUyTDY0IDUzTDYzIDUzTDYzIDU0TDY3IDU0TDY3IDU1TDY4IDU1TDY4IDU0TDY3IDU0TDY3IDUzTDY4IDUzTDY4IDUyTDY2IDUyTDY2IDUxTDY3IDUxTDY3IDUwTDY4IDUwTDY4IDUxTDcwIDUxTDcwIDUwTDY5IDUwTDY5IDQ5TDY4IDQ5TDY4IDQ4TDY3IDQ4TDY3IDQ3TDY5IDQ3TDY5IDQ4TDcwIDQ4TDcwIDQ5TDcxIDQ5TDcxIDUxTDcyIDUxTDcyIDUyTDcwIDUyTDcwIDUzTDcxIDUzTDcxIDU0TDY5IDU0TDY5IDU1TDcyIDU1TDcyIDU2TDcwIDU2TDcwIDU4TDcxIDU4TDcxIDU5TDcyIDU5TDcyIDYwTDcwIDYwTDcwIDYxTDcxIDYxTDcxIDYyTDY5IDYyTDY5IDYwTDY4IDYwTDY4IDU5TDY5IDU5TDY5IDU3TDY4IDU3TDY4IDU2TDY2IDU2TDY2IDU1TDY1IDU1TDY1IDU2TDY0IDU2TDY0IDU3TDYyIDU3TDYyIDU4TDYxIDU4TDYxIDU5TDYyIDU5TDYyIDYwTDY0IDYwTDY0IDYxTDY1IDYxTDY1IDYzTDYyIDYzTDYyIDYyTDYzIDYyTDYzIDYxTDYyIDYxTDYyIDYyTDYxIDYyTDYxIDYxTDYwIDYxTDYwIDYyTDYxIDYyTDYxIDYzTDYyIDYzTDYyIDY0TDYxIDY0TDYxIDY1TDYwIDY1TDYwIDY0TDU4IDY0TDU4IDYzTDU5IDYzTDU5IDYyTDU4IDYyTDU4IDYxTDU3IDYxTDU3IDYyTDU2IDYyTDU2IDY0TDU4IDY0TDU4IDY1TDU3IDY1TDU3IDY2TDU4IDY2TDU4IDY3TDU2IDY3TDU2IDY4TDU4IDY4TDU4IDY5TDU1IDY5TDU1IDY4TDU0IDY4TDU0IDcwTDUzIDcwTDUzIDcxTDQ5IDcxTDQ5IDcyTDUxIDcyTDUxIDczTDUzIDczTDUzIDc0TDUyIDc0TDUyIDc1TDUxIDc1TDUxIDc2TDUzIDc2TDUzIDc4TDU0IDc4TDU0IDc5TDUzIDc5TDUzIDgwTDU1IDgwTDU1IDgxTDUzIDgxTDUzIDgzTDU0IDgzTDU0IDg0TDU1IDg0TDU1IDg1TDU0IDg1TDU0IDg2TDU1IDg2TDU1IDg3TDU0IDg3TDU0IDg4TDU2IDg4TDU2IDg2TDU1IDg2TDU1IDg1TDU2IDg1TDU2IDg0TDU1IDg0TDU1IDgzTDU2IDgzTDU2IDgxTDU3IDgxTDU3IDgyTDU4IDgyTDU4IDgxTDU5IDgxTDU5IDgwTDU4IDgwTDU4IDc5TDYwIDc5TDYwIDgxTDYxIDgxTDYxIDgyTDU5IDgyTDU5IDg0TDYwIDg0TDYwIDgzTDYxIDgzTDYxIDgyTDYyIDgyTDYyIDgzTDYzIDgzTDYzIDg0TDYyIDg0TDYyIDg1TDYxIDg1TDYxIDg3TDYyIDg3TDYyIDg5TDYxIDg5TDYxIDkwTDYwIDkwTDYwIDkxTDYxIDkxTDYxIDkyTDYyIDkyTDYyIDkxTDYxIDkxTDYxIDkwTDYzIDkwTDYzIDg4TDY0IDg4TDY0IDkxTDYzIDkxTDYzIDkyTDY0IDkyTDY0IDkxTDY1IDkxTDY1IDkyTDY3IDkyTDY3IDkxTDY4IDkxTDY4IDkwTDY5IDkwTDY5IDg5TDcyIDg5TDcyIDkwTDcwIDkwTDcwIDkyTDcxIDkyTDcxIDkxTDcyIDkxTDcyIDkwTDc0IDkwTDc0IDkxTDc1IDkxTDc1IDkyTDc2IDkyTDc2IDkxTDc3IDkxTDc3IDkwTDc4IDkwTDc4IDg5TDc3IDg5TDc3IDg4TDc4IDg4TDc4IDg3TDc3IDg3TDc3IDg2TDc5IDg2TDc5IDg1TDgwIDg1TDgwIDg2TDgxIDg2TDgxIDg1TDgyIDg1TDgyIDg0TDgzIDg0TDgzIDgzTDg0IDgzTDg0IDg0TDg1IDg0TDg1IDgzTDg0IDgzTDg0IDgyTDg1IDgyTDg1IDgxTDg0IDgxTDg0IDgyTDgzIDgyTDgzIDgzTDgyIDgzTDgyIDgyTDgwIDgyTDgwIDgzTDc4IDgzTDc4IDg0TDc3IDg0TDc3IDg1TDc2IDg1TDc2IDkwTDc1IDkwTDc1IDg2TDc0IDg2TDc0IDg1TDc1IDg1TDc1IDg0TDc2IDg0TDc2IDgzTDc1IDgzTDc1IDgyTDc0IDgyTDc0IDgxTDc1IDgxTDc1IDgwTDc2IDgwTDc2IDc5TDczIDc5TDczIDc4TDc0IDc4TDc0IDc2TDczIDc2TDczIDc4TDcxIDc4TDcxIDc5TDczIDc5TDczIDgyTDcxIDgyTDcxIDgzTDcwIDgzTDcwIDg0TDY3IDg0TDY3IDg2TDY2IDg2TDY2IDgzTDY4IDgzTDY4IDgxTDcyIDgxTDcyIDgwTDY5IDgwTDY5IDc5TDcwIDc5TDcwIDc4TDY5IDc4TDY5IDc5TDY4IDc5TDY4IDc3TDY5IDc3TDY5IDc2TDY2IDc2TDY2IDc3TDY3IDc3TDY3IDc4TDY1IDc4TDY1IDc0TDY2IDc0TDY2IDc1TDY5IDc1TDY5IDczTDcwIDczTDcwIDc0TDcxIDc0TDcxIDc1TDcwIDc1TDcwIDc3TDcyIDc3TDcyIDc2TDcxIDc2TDcxIDc1TDc0IDc1TDc0IDc0TDc1IDc0TDc1IDcxTDczIDcxTDczIDcwTDc0IDcwTDc0IDY5TDczIDY5TDczIDY4TDc2IDY4TDc2IDY3TDc0IDY3TDc0IDY2TDc1IDY2TDc1IDY0TDc2IDY0TDc2IDY1TDc3IDY1TDc3IDY2TDc5IDY2TDc5IDY3TDc4IDY3TDc4IDY4TDc3IDY4TDc3IDY5TDc1IDY5TDc1IDcwTDc2IDcwTDc2IDcxTDc4IDcxTDc4IDcyTDc5IDcyTDc5IDc0TDgwIDc0TDgwIDc1TDc5IDc1TDc5IDc3TDc4IDc3TDc4IDc1TDc3IDc1TDc3IDc3TDc2IDc3TDc2IDc4TDc4IDc4TDc4IDgwTDc3IDgwTDc3IDgyTDc5IDgyTDc5IDgxTDgwIDgxTDgwIDgwTDc5IDgwTDc5IDc3TDgwIDc3TDgwIDc4TDgxIDc4TDgxIDc5TDgyIDc5TDgyIDgwTDgzIDgwTDgzIDc5TDg0IDc5TDg0IDc4TDg1IDc4TDg1IDc3TDg3IDc3TDg3IDc1TDkxIDc1TDkxIDc0TDkwIDc0TDkwIDczTDg3IDczTDg3IDcyTDg4IDcyTDg4IDcxTDg3IDcxTDg3IDY4TDg4IDY4TDg4IDY3TDg3IDY3TDg3IDY2TDg2IDY2TDg2IDY1TDg4IDY1TDg4IDY0TDg2IDY0TDg2IDY1TDg1IDY1TDg1IDYzTDg3IDYzTDg3IDYyTDg2IDYyTDg2IDYxTDg1IDYxTDg1IDYzTDg0IDYzTDg0IDYyTDgzIDYyTDgzIDYzTDgyIDYzTDgyIDYyTDgxIDYyTDgxIDYxTDgzIDYxTDgzIDYwTDg0IDYwTDg0IDU5TDgyIDU5TDgyIDU4TDgwIDU4TDgwIDU3TDgxIDU3TDgxIDU1TDgwIDU1TDgwIDU2TDc4IDU2TDc4IDU3TDc3IDU3TDc3IDU1TDcyIDU1TDcyIDU0TDc0IDU0TDc0IDUyTDc1IDUyTDc1IDUxTDc0IDUxTDc0IDUwTDc1IDUwTDc1IDQ5TDc0IDQ5TDc0IDUwTDczIDUwTDczIDUxTDcyIDUxTDcyIDQ4TDcxIDQ4TDcxIDQ3TDcwIDQ3TDcwIDQ2TDY4IDQ2TDY4IDQ0TDY2IDQ0TDY2IDQzTDY4IDQzTDY4IDQxTDY5IDQxTDY5IDM5TDcwIDM5TDcwIDQwTDcxIDQwTDcxIDQxTDcwIDQxTDcwIDQyTDY5IDQyTDY5IDQzTDcwIDQzTDcwIDQ1TDczIDQ1TDczIDQ2TDcyIDQ2TDcyIDQ3TDczIDQ3TDczIDQ2TDc0IDQ2TDc0IDQ4TDc2IDQ4TDc2IDQ3TDc3IDQ3TDc3IDQ2TDc4IDQ2TDc4IDQ1TDc3IDQ1TDc3IDQzTDczIDQzTDczIDQ0TDcxIDQ0TDcxIDQzTDcwIDQzTDcwIDQyTDcxIDQyTDcxIDQxTDcyIDQxTDcyIDQyTDc0IDQyTDc0IDQxTDcyIDQxTDcyIDQwTDcxIDQwTDcxIDM5TDczIDM5TDczIDM4TDc0IDM4TDc0IDQwTDc2IDQwTDc2IDQyTDc5IDQyTDc5IDQzTDc4IDQzTDc4IDQ0TDc5IDQ0TDc5IDQ3TDgwIDQ3TDgwIDQ1TDgxIDQ1TDgxIDQ0TDgyIDQ0TDgyIDQyTDgxIDQyTDgxIDQxTDg0IDQxTDg0IDQyTDgzIDQyTDgzIDQzTDg2IDQzTDg2IDQ0TDg1IDQ0TDg1IDQ1TDg2IDQ1TDg2IDQ0TDg3IDQ0TDg3IDQzTDkxIDQzTDkxIDQyTDkwIDQyTDkwIDQxTDkxIDQxTDkxIDQwTDkwIDQwTDkwIDM4TDg5IDM4TDg5IDM1TDg4IDM1TDg4IDMzTDg3IDMzTDg3IDM1TDg2IDM1TDg2IDMzTDg1IDMzTDg1IDM0TDgzIDM0TDgzIDM1TDgyIDM1TDgyIDM0TDgxIDM0TDgxIDMyTDgwIDMyTDgwIDMxTDgxIDMxTDgxIDMwTDgwIDMwTDgwIDI5TDgxIDI5TDgxIDI4TDgyIDI4TDgyIDI5TDgzIDI5TDgzIDI4TDg0IDI4TDg0IDI3TDg1IDI3TDg1IDI4TDg2IDI4TDg2IDI3TDg3IDI3TDg3IDI2TDg4IDI2TDg4IDI4TDg5IDI4TDg5IDI5TDkwIDI5TDkwIDI4TDg5IDI4TDg5IDI2TDkwIDI2TDkwIDI1TDg5IDI1TDg5IDI0TDkwIDI0TDkwIDIzTDg4IDIzTDg4IDIyTDg2IDIyTDg2IDIxTDg5IDIxTDg5IDIyTDkwIDIyTDkwIDIxTDkxIDIxTDkxIDIwTDkwIDIwTDkwIDE5TDg3IDE5TDg3IDE4TDg2IDE4TDg2IDE3TDg4IDE3TDg4IDE4TDg5IDE4TDg5IDE3TDg4IDE3TDg4IDE2TDg1IDE2TDg1IDE3TDgyIDE3TDgyIDE2TDg0IDE2TDg0IDE1TDgzIDE1TDgzIDE0TDg1IDE0TDg1IDEyTDg2IDEyTDg2IDE1TDg4IDE1TDg4IDEzTDg3IDEzTDg3IDEyTDg5IDEyTDg5IDExTDg3IDExTDg3IDEwTDg4IDEwTDg4IDlMODcgOUw4NyAxMEw4NiAxMEw4NiAxMUw4NSAxMUw4NSA5TDg0IDlMODQgNkw4MyA2TDgzIDVMODIgNUw4MiA0TDgwIDRMODAgNUw3OCA1TDc4IDZMNzcgNkw3NyA5TDc1IDlMNzUgMTBMNzcgMTBMNzcgMTFMNzUgMTFMNzUgMTJMNzQgMTJMNzQgMTNMNzMgMTNMNzMgMTRMNzIgMTRMNzIgMTJMNzMgMTJMNzMgMTFMNzIgMTFMNzIgMTBMNzEgMTBMNzEgOUw3MiA5TDcyIDhMNzMgOEw3MyA3TDc0IDdMNzQgNkw3MyA2TDczIDdMNzIgN0w3MiA1TDY5IDVMNjkgNEw3MiA0TDcyIDNMNjkgM0w2OSA0TDY4IDRMNjggM0w2NyAzTDY3IDJMNjYgMkw2NiAzTDY3IDNMNjcgNUw2NiA1TDY2IDRMNjQgNEw2NCA1TDY1IDVMNjUgN0w2NCA3TDY0IDZMNjMgNkw2MyA1TDYyIDVMNjIgNkw2MSA2TDYxIDhMNjIgOEw2MiA2TDYzIDZMNjMgN0w2NCA3TDY0IDhMNjcgOEw2NyA5TDY4IDlMNjggMTBMNjcgMTBMNjcgMTFMNjYgMTFMNjYgMTJMNjcgMTJMNjcgMTRMNjYgMTRMNjYgMTNMNjUgMTNMNjUgMTJMNjQgMTJMNjQgMTFMNjEgMTFMNjEgMTBMNjIgMTBMNjIgOUw2MSA5TDYxIDEwTDYwIDEwTDYwIDExTDYxIDExTDYxIDEzTDYwIDEzTDYwIDE0TDU5IDE0TDU5IDEyTDU4IDEyTDU4IDEzTDU3IDEzTDU3IDEyTDU1IDEyTDU1IDExTDU0IDExTDU0IDEwTDU2IDEwTDU2IDExTDU3IDExTDU3IDEwTDU2IDEwTDU2IDlMNTUgOUw1NSA4TDUzIDhMNTMgN0w1NCA3TDU0IDZMNTUgNkw1NSA3TDU2IDdMNTYgNUw1NCA1TDU0IDRMNTYgNEw1NiAzTDU1IDNMNTUgMUw1NCAxTDU0IDJMNTIgMkw1MiA1TDUxIDVMNTEgM0w0OSAzTDQ5IDRMNTAgNEw1MCA1TDUxIDVMNTEgOEw1MCA4TDUwIDlMNTEgOUw1MSA4TDUyIDhMNTIgMTBMNDkgMTBMNDkgMTFMNTAgMTFMNTAgMTJMNDkgMTJMNDkgMTVMNTAgMTVMNTAgMTdMNDkgMTdMNDkgMTZMNDggMTZMNDggMTFMNDcgMTFMNDcgMTBMNDggMTBMNDggOUw0OSA5TDQ5IDhMNDcgOEw0NyA3TDQ2IDdMNDYgOEw0NyA4TDQ3IDlMNDYgOUw0NiAxMUw0NSAxMUw0NSAxMEw0NCAxMEw0NCA5TDQ1IDlMNDUgOEw0MyA4TDQzIDlMNDEgOUw0MSAxMEw0MCAxMEw0MCA4TDM5IDhMMzkgN0w0MCA3TDQwIDRMMzkgNEwzOSAxWk01NyAyTDU3IDNMNTggM0w1OCAyWk02NCAyTDY0IDNMNjUgM0w2NSAyWk01MyAzTDUzIDRMNTQgNEw1NCAzWk0yOSA1TDI5IDhMMzIgOEwzMiA1Wk0zOCA1TDM4IDdMMzcgN0wzNyA4TDM1IDhMMzUgOUwzNiA5TDM2IDEwTDM4IDEwTDM4IDlMMzkgOUwzOSA4TDM4IDhMMzggN0wzOSA3TDM5IDVaTTU3IDVMNTcgOEw2MCA4TDYwIDVaTTY3IDVMNjcgNkw2NiA2TDY2IDdMNjcgN0w2NyA4TDY4IDhMNjggOUw2OSA5TDY5IDEwTDY4IDEwTDY4IDExTDY3IDExTDY3IDEyTDY4IDEyTDY4IDEzTDY5IDEzTDY5IDE0TDcxIDE0TDcxIDEyTDY5IDEyTDY5IDExTDcxIDExTDcxIDEwTDcwIDEwTDcwIDhMNzIgOEw3MiA3TDcxIDdMNzEgNkw3MCA2TDcwIDdMNjkgN0w2OSA1Wk0xMiA2TDEyIDdMMTMgN0wxMyA2Wk0xOCA2TDE4IDhMMTcgOEwxNyA5TDE4IDlMMTggMTJMMTcgMTJMMTcgMTNMMTggMTNMMTggMTRMMjAgMTRMMjAgMTVMMjEgMTVMMjEgMTNMMjAgMTNMMjAgMTJMMjEgMTJMMjEgMTFMMjAgMTFMMjAgMTJMMTkgMTJMMTkgMTBMMjAgMTBMMjAgOEwxOSA4TDE5IDZaTTI2IDZMMjYgN0wyNyA3TDI3IDZaTTMwIDZMMzAgN0wzMSA3TDMxIDZaTTQzIDZMNDMgN0w0NCA3TDQ0IDZaTTQ5IDZMNDkgN0w1MCA3TDUwIDZaTTUyIDZMNTIgN0w1MyA3TDUzIDZaTTU4IDZMNTggN0w1OSA3TDU5IDZaTTY3IDZMNjcgN0w2OCA3TDY4IDZaTTc1IDZMNzUgOEw3NiA4TDc2IDZaTTc4IDZMNzggMTBMNzkgMTBMNzkgMTJMNzggMTJMNzggMTFMNzcgMTFMNzcgMTNMNzggMTNMNzggMTRMNzcgMTRMNzcgMTVMNzYgMTVMNzYgMTJMNzUgMTJMNzUgMTRMNzQgMTRMNzQgMTZMNzMgMTZMNzMgMTdMNzQgMTdMNzQgMThMNzMgMThMNzMgMTlMNzQgMTlMNzQgMjBMNzMgMjBMNzMgMjFMNzQgMjFMNzQgMjJMNzEgMjJMNzEgMTlMNzIgMTlMNzIgMTdMNzEgMTdMNzEgMThMNzAgMThMNzAgMTZMNzIgMTZMNzIgMTVMNzAgMTVMNzAgMTZMNjkgMTZMNjkgMTdMNjggMTdMNjggMTlMNjkgMTlMNjkgMjBMNjggMjBMNjggMjFMNjkgMjFMNjkgMjJMNzEgMjJMNzEgMjNMNzYgMjNMNzYgMjRMNzQgMjRMNzQgMjZMNzMgMjZMNzMgMjRMNzIgMjRMNzIgMjVMNzEgMjVMNzEgMjdMNzIgMjdMNzIgMjhMNzQgMjhMNzQgMjdMNzYgMjdMNzYgMjZMNzcgMjZMNzcgMjdMNzggMjdMNzggMjhMNzcgMjhMNzcgMjlMNzggMjlMNzggMzBMNzcgMzBMNzcgMzFMNzYgMzFMNzYgMjhMNzUgMjhMNzUgMzBMNzMgMzBMNzMgMjlMNzIgMjlMNzIgMzFMNzEgMzFMNzEgMzBMNzAgMzBMNzAgMjlMNzEgMjlMNzEgMjhMNzAgMjhMNzAgMjdMNjcgMjdMNjcgMjhMNjYgMjhMNjYgMjZMNjUgMjZMNjUgMjNMNjcgMjNMNjcgMjFMNjYgMjFMNjYgMjJMNjUgMjJMNjUgMjFMNjQgMjFMNjQgMjBMNjUgMjBMNjUgMTlMNjYgMTlMNjYgMjBMNjcgMjBMNjcgMTlMNjYgMTlMNjYgMThMNjcgMThMNjcgMTZMNjggMTZMNjggMTVMNjYgMTVMNjYgMTZMNjUgMTZMNjUgMTdMNjYgMTdMNjYgMThMNjUgMThMNjUgMTlMNjQgMTlMNjQgMTZMNjMgMTZMNjMgMTRMNjQgMTRMNjQgMTVMNjUgMTVMNjUgMTNMNjQgMTNMNjQgMTJMNjMgMTJMNjMgMTNMNjIgMTNMNjIgMTRMNjEgMTRMNjEgMTZMNjAgMTZMNjAgMTVMNTkgMTVMNTkgMTRMNTggMTRMNTggMTZMNTcgMTZMNTcgMTdMNTggMTdMNTggMThMNTYgMThMNTYgMTdMNTUgMTdMNTUgMTVMNTYgMTVMNTYgMTRMNTcgMTRMNTcgMTNMNTYgMTNMNTYgMTRMNTUgMTRMNTUgMTJMNTQgMTJMNTQgMTFMNTMgMTFMNTMgMTBMNTQgMTBMNTQgOUw1MyA5TDUzIDEwTDUyIDEwTDUyIDEyTDUwIDEyTDUwIDEzTDUyIDEzTDUyIDE0TDUxIDE0TDUxIDE3TDUyIDE3TDUyIDE4TDUxIDE4TDUxIDE5TDUyIDE5TDUyIDIwTDUxIDIwTDUxIDIzTDUwIDIzTDUwIDIxTDQ4IDIxTDQ4IDIwTDUwIDIwTDUwIDE5TDQ5IDE5TDQ5IDE4TDQ4IDE4TDQ4IDE2TDQ3IDE2TDQ3IDE0TDQ1IDE0TDQ1IDE1TDQ2IDE1TDQ2IDE2TDQzIDE2TDQzIDE1TDQyIDE1TDQyIDEzTDQwIDEzTDQwIDE2TDQzIDE2TDQzIDE3TDQ3IDE3TDQ3IDE4TDQ2IDE4TDQ2IDE5TDQ1IDE5TDQ1IDIwTDQzIDIwTDQzIDE5TDQxIDE5TDQxIDIxTDQyIDIxTDQyIDIyTDQwIDIyTDQwIDIwTDM5IDIwTDM5IDE2TDM2IDE2TDM2IDE3TDM1IDE3TDM1IDE1TDM0IDE1TDM0IDE4TDM1IDE4TDM1IDE5TDM2IDE5TDM2IDIwTDM3IDIwTDM3IDE4TDM4IDE4TDM4IDIyTDM3IDIyTDM3IDIxTDM2IDIxTDM2IDIyTDM3IDIyTDM3IDIzTDM4IDIzTDM4IDI0TDQwIDI0TDQwIDI2TDM5IDI2TDM5IDI3TDM4IDI3TDM4IDI4TDM2IDI4TDM2IDMwTDM4IDMwTDM4IDI5TDM5IDI5TDM5IDI3TDQxIDI3TDQxIDI4TDQwIDI4TDQwIDMwTDQxIDMwTDQxIDI4TDQyIDI4TDQyIDMwTDQzIDMwTDQzIDI4TDQ0IDI4TDQ0IDI5TDQ1IDI5TDQ1IDMwTDQ0IDMwTDQ0IDMxTDQ1IDMxTDQ1IDMyTDQ2IDMyTDQ2IDM0TDQ3IDM0TDQ3IDM1TDQ1IDM1TDQ1IDMzTDQ0IDMzTDQ0IDM0TDQzIDM0TDQzIDM1TDQ1IDM1TDQ1IDM2TDQ3IDM2TDQ3IDM1TDQ5IDM1TDQ5IDM2TDQ4IDM2TDQ4IDM3TDUxIDM3TDUxIDM5TDUwIDM5TDUwIDQwTDQ5IDQwTDQ5IDM4TDQ3IDM4TDQ3IDM3TDQ0IDM3TDQ0IDM2TDQzIDM2TDQzIDM3TDQ0IDM3TDQ0IDM4TDQyIDM4TDQyIDM3TDQxIDM3TDQxIDM5TDQ0IDM5TDQ0IDQxTDQzIDQxTDQzIDQwTDM5IDQwTDM5IDQxTDM4IDQxTDM4IDQyTDM5IDQyTDM5IDQxTDQzIDQxTDQzIDQyTDQxIDQyTDQxIDQzTDQyIDQzTDQyIDQ0TDQzIDQ0TDQzIDQ1TDQyIDQ1TDQyIDQ2TDQxIDQ2TDQxIDQ1TDM5IDQ1TDM5IDQzTDM4IDQzTDM4IDQ1TDM5IDQ1TDM5IDQ2TDM3IDQ2TDM3IDQ3TDM2IDQ3TDM2IDQ5TDM1IDQ5TDM1IDQ2TDM0IDQ2TDM0IDQ3TDMyIDQ3TDMyIDQ2TDMxIDQ2TDMxIDQ1TDMyIDQ1TDMyIDQ0TDMwIDQ0TDMwIDQyTDMxIDQyTDMxIDQzTDM0IDQzTDM0IDQyTDM1IDQyTDM1IDQxTDM0IDQxTDM0IDQwTDMzIDQwTDMzIDM5TDMyIDM5TDMyIDM4TDMzIDM4TDMzIDM3TDMyIDM3TDMyIDM2TDMxIDM2TDMxIDM3TDMwIDM3TDMwIDM2TDI5IDM2TDI5IDM3TDI3IDM3TDI3IDM4TDMwIDM4TDMwIDQyTDI5IDQyTDI5IDQ0TDI4IDQ0TDI4IDQ1TDI3IDQ1TDI3IDQ0TDI2IDQ0TDI2IDQzTDI1IDQzTDI1IDQ0TDI0IDQ0TDI0IDQ2TDIyIDQ2TDIyIDQ1TDIxIDQ1TDIxIDQ2TDIyIDQ2TDIyIDQ3TDIxIDQ3TDIxIDQ4TDIwIDQ4TDIwIDQ5TDIxIDQ5TDIxIDUxTDE5IDUxTDE5IDUwTDE4IDUwTDE4IDUxTDE5IDUxTDE5IDUyTDIxIDUyTDIxIDUzTDIzIDUzTDIzIDU0TDIyIDU0TDIyIDU3TDIxIDU3TDIxIDU4TDIyIDU4TDIyIDU5TDI3IDU5TDI3IDU4TDI2IDU4TDI2IDU2TDI1IDU2TDI1IDU0TDI2IDU0TDI2IDU1TDI3IDU1TDI3IDU2TDI4IDU2TDI4IDYwTDI0IDYwTDI0IDYxTDIzIDYxTDIzIDYyTDIxIDYyTDIxIDYzTDE5IDYzTDE5IDY0TDE4IDY0TDE4IDYyTDIwIDYyTDIwIDYxTDE5IDYxTDE5IDYwTDIxIDYwTDIxIDU5TDE5IDU5TDE5IDYwTDE4IDYwTDE4IDYxTDE3IDYxTDE3IDYwTDE2IDYwTDE2IDYyTDE0IDYyTDE0IDY2TDE1IDY2TDE1IDY0TDE3IDY0TDE3IDY1TDE5IDY1TDE5IDY0TDIwIDY0TDIwIDY2TDE2IDY2TDE2IDY4TDE3IDY4TDE3IDY5TDE4IDY5TDE4IDY4TDE3IDY4TDE3IDY3TDIxIDY3TDIxIDY2TDIzIDY2TDIzIDY1TDI1IDY1TDI1IDY0TDI2IDY0TDI2IDYzTDI5IDYzTDI5IDY1TDMwIDY1TDMwIDY0TDMzIDY0TDMzIDY1TDM1IDY1TDM1IDY3TDM2IDY3TDM2IDY4TDM4IDY4TDM4IDY5TDM2IDY5TDM2IDcwTDM4IDcwTDM4IDcxTDM3IDcxTDM3IDc0TDM4IDc0TDM4IDc1TDM5IDc1TDM5IDc0TDM4IDc0TDM4IDcxTDM5IDcxTDM5IDcwTDQwIDcwTDQwIDcxTDQzIDcxTDQzIDcyTDQ1IDcyTDQ1IDcwTDQ0IDcwTDQ0IDY5TDQ1IDY5TDQ1IDY4TDQ2IDY4TDQ2IDY5TDQ3IDY5TDQ3IDY4TDQ2IDY4TDQ2IDY2TDQ3IDY2TDQ3IDY3TDQ4IDY3TDQ4IDY2TDUyIDY2TDUyIDY1TDUzIDY1TDUzIDY0TDUwIDY0TDUwIDYzTDUzIDYzTDUzIDYyTDUwIDYyTDUwIDYzTDQ4IDYzTDQ4IDYyTDQ3IDYyTDQ3IDYxTDUyIDYxTDUyIDYwTDUwIDYwTDUwIDU5TDUxIDU5TDUxIDU4TDUwIDU4TDUwIDU5TDQ4IDU5TDQ4IDU4TDQ5IDU4TDQ5IDU3TDUwIDU3TDUwIDU2TDQ5IDU2TDQ5IDU1TDUxIDU1TDUxIDU0TDUyIDU0TDUyIDU1TDUzIDU1TDUzIDU2TDUyIDU2TDUyIDU3TDU1IDU3TDU1IDU2TDU0IDU2TDU0IDU1TDU2IDU1TDU2IDU0TDU0IDU0TDU0IDUzTDU2IDUzTDU2IDUyTDU4IDUyTDU4IDUxTDU2IDUxTDU2IDQ5TDU3IDQ5TDU3IDQ4TDU4IDQ4TDU4IDQ2TDU5IDQ2TDU5IDQ1TDU4IDQ1TDU4IDQ0TDYyIDQ0TDYyIDQzTDY0IDQzTDY0IDQ0TDYzIDQ0TDYzIDQ1TDYyIDQ1TDYyIDQ2TDYwIDQ2TDYwIDQ3TDU5IDQ3TDU5IDQ4TDYwIDQ4TDYwIDQ5TDYxIDQ5TDYxIDQ3TDY0IDQ3TDY0IDQ1TDY1IDQ1TDY1IDQzTDY2IDQzTDY2IDQyTDY1IDQyTDY1IDQwTDY2IDQwTDY2IDM5TDY3IDM5TDY3IDQwTDY4IDQwTDY4IDM5TDY3IDM5TDY3IDM4TDY4IDM4TDY4IDM3TDY5IDM3TDY5IDM4TDcwIDM4TDcwIDM5TDcxIDM5TDcxIDM4TDcwIDM4TDcwIDM3TDY5IDM3TDY5IDM2TDcwIDM2TDcwIDM1TDcxIDM1TDcxIDMzTDcwIDMzTDcwIDMyTDY5IDMyTDY5IDM0TDcwIDM0TDcwIDM1TDY4IDM1TDY4IDM0TDY3IDM0TDY3IDM2TDY2IDM2TDY2IDM4TDY1IDM4TDY1IDM1TDY2IDM1TDY2IDM0TDY1IDM0TDY1IDM1TDY0IDM1TDY0IDMyTDY2IDMyTDY2IDMzTDY3IDMzTDY3IDMyTDY4IDMyTDY4IDMxTDY3IDMxTDY3IDMwTDcwIDMwTDcwIDMxTDcxIDMxTDcxIDMyTDcyIDMyTDcyIDMxTDc2IDMxTDc2IDMyTDc1IDMyTDc1IDMzTDc0IDMzTDc0IDM0TDczIDM0TDczIDM1TDcyIDM1TDcyIDM2TDczIDM2TDczIDM3TDcyIDM3TDcyIDM4TDczIDM4TDczIDM3TDc0IDM3TDc0IDM2TDc1IDM2TDc1IDM3TDc2IDM3TDc2IDM2TDc1IDM2TDc1IDM1TDc2IDM1TDc2IDM0TDc5IDM0TDc5IDMzTDc4IDMzTDc4IDMxTDgwIDMxTDgwIDMwTDc5IDMwTDc5IDI4TDgwIDI4TDgwIDI3TDgyIDI3TDgyIDI4TDgzIDI4TDgzIDI2TDgyIDI2TDgyIDI1TDg0IDI1TDg0IDIzTDg2IDIzTDg2IDI0TDg1IDI0TDg1IDI3TDg2IDI3TDg2IDI2TDg3IDI2TDg3IDIzTDg2IDIzTDg2IDIyTDg1IDIyTDg1IDIwTDg3IDIwTDg3IDE5TDg1IDE5TDg1IDE4TDgxIDE4TDgxIDE3TDgwIDE3TDgwIDE4TDgxIDE4TDgxIDIwTDgwIDIwTDgwIDE5TDc4IDE5TDc4IDE4TDc1IDE4TDc1IDE3TDc3IDE3TDc3IDE1TDc4IDE1TDc4IDE3TDc5IDE3TDc5IDE2TDgxIDE2TDgxIDE0TDgzIDE0TDgzIDEzTDg0IDEzTDg0IDEyTDg1IDEyTDg1IDExTDg0IDExTDg0IDEyTDgzIDEyTDgzIDEzTDgyIDEzTDgyIDEyTDgxIDEyTDgxIDE0TDgwIDE0TDgwIDE1TDc5IDE1TDc5IDEyTDgwIDEyTDgwIDExTDgyIDExTDgyIDdMODMgN0w4MyA2TDgyIDZMODIgN0w4MSA3TDgxIDZMODAgNkw4MCA3TDc5IDdMNzkgNlpNMjMgN0wyMyAxMEwyMiAxMEwyMiA4TDIxIDhMMjEgMTBMMjIgMTBMMjIgMTFMMjMgMTFMMjMgMTBMMjQgMTBMMjQgN1pNMjUgOEwyNSAxMkwyNCAxMkwyNCAxM0wyNSAxM0wyNSAxNEwyNiAxNEwyNiAxM0wyOCAxM0wyOCAxMkwyNyAxMkwyNyAxMUwyOSAxMUwyOSAxNEwzMCAxNEwzMCAxNkwzMSAxNkwzMSAxN0wzMCAxN0wzMCAxOUwzMSAxOUwzMSAxN0wzMiAxN0wzMiAxNkwzMSAxNkwzMSAxNEwzMyAxNEwzMyAxM0wzNCAxM0wzNCAxNEwzNSAxNEwzNSAxMUwzNCAxMUwzNCAxMkwzMyAxMkwzMyAxMUwzMiAxMUwzMiAxMkwzMSAxMkwzMSAxMUwyOSAxMUwyOSAxMEwyNyAxMEwyNyA4Wk03OSA4TDc5IDlMODEgOUw4MSA4Wk0yIDlMMiAxMEwzIDEwTDMgMTFMNCAxMUw0IDEyTDUgMTJMNSAxM0wzIDEzTDMgMTRMNSAxNEw1IDE1TDMgMTVMMyAxNkwyIDE2TDIgMTdMNCAxN0w0IDE4TDUgMThMNSAxN0w0IDE3TDQgMTZMNyAxNkw3IDE3TDYgMTdMNiAxOEw3IDE4TDcgMTdMOCAxN0w4IDE2TDcgMTZMNyAxNUw4IDE1TDggMTJMNyAxMkw3IDExTDYgMTFMNiAxMEw1IDEwTDUgMTFMNCAxMUw0IDEwTDMgMTBMMyA5Wk0xNCA5TDE0IDEwTDE1IDEwTDE1IDlaTTY0IDlMNjQgMTBMNjYgMTBMNjYgOVpNNzMgOUw3MyAxMEw3NCAxMEw3NCA5Wk05MCA5TDkwIDExTDkxIDExTDkxIDEyTDkyIDEyTDkyIDExTDkxIDExTDkxIDEwTDkyIDEwTDkyIDlaTTI2IDEwTDI2IDExTDI3IDExTDI3IDEwWk0zOSAxMEwzOSAxMUw0MCAxMUw0MCAxMkw0MSAxMkw0MSAxMUw0MiAxMUw0MiAxMkw0MyAxMkw0MyAxM0w0NyAxM0w0NyAxMkw0MyAxMkw0MyAxMUw0NCAxMUw0NCAxMEw0MSAxMEw0MSAxMUw0MCAxMUw0MCAxMFpNMSAxMUwxIDEyTDIgMTJMMiAxMVpNMzYgMTFMMzYgMTRMMzggMTRMMzggMTVMMzkgMTVMMzkgMTNMMzggMTNMMzggMTFaTTg2IDExTDg2IDEyTDg3IDEyTDg3IDExWk02IDEyTDYgMTNMNSAxM0w1IDE0TDYgMTRMNiAxNUw3IDE1TDcgMTRMNiAxNEw2IDEzTDcgMTNMNyAxMlpNMjUgMTJMMjUgMTNMMjYgMTNMMjYgMTJaTTMwIDEyTDMwIDE0TDMxIDE0TDMxIDEyWk01MyAxMkw1MyAxNUw1NSAxNUw1NSAxNEw1NCAxNEw1NCAxMlpNOTEgMTNMOTEgMTRMOTIgMTRMOTIgMTNaTTE1IDE0TDE1IDE1TDE0IDE1TDE0IDE2TDEzIDE2TDEzIDE3TDEyIDE3TDEyIDE4TDExIDE4TDExIDE5TDEyIDE5TDEyIDE4TDEzIDE4TDEzIDE3TDE0IDE3TDE0IDE4TDE1IDE4TDE1IDE3TDE0IDE3TDE0IDE2TDE1IDE2TDE1IDE1TDE2IDE1TDE2IDE0Wk01MiAxNkw1MiAxN0w1MyAxN0w1MyAxOEw1NCAxOEw1NCAxOUw1MyAxOUw1MyAyMUw1MiAyMUw1MiAyMkw1NSAyMkw1NSAyMUw1NiAyMUw1NiAyMkw1NyAyMkw1NyAyMUw1OCAyMUw1OCAyMEw1NiAyMEw1NiAxOUw1NSAxOUw1NSAxOEw1NCAxOEw1NCAxNlpNNTggMTZMNTggMTdMNTkgMTdMNTkgMTlMNjAgMTlMNjAgMjBMNTkgMjBMNTkgMjFMNjAgMjFMNjAgMjJMNTkgMjJMNTkgMjNMNTggMjNMNTggMjZMNTkgMjZMNTkgMjdMNTggMjdMNTggMjhMNjAgMjhMNjAgMjZMNjIgMjZMNjIgMjdMNjEgMjdMNjEgMzBMNjIgMzBMNjIgMzJMNjEgMzJMNjEgMzNMNTkgMzNMNTkgMzRMNTggMzRMNTggMzNMNTcgMzNMNTcgMzRMNTYgMzRMNTYgMzVMNTggMzVMNTggMzZMNTcgMzZMNTcgMzhMNTYgMzhMNTYgMzlMNTUgMzlMNTUgMzdMNTYgMzdMNTYgMzZMNTQgMzZMNTQgMzVMNTMgMzVMNTMgMzRMNTUgMzRMNTUgMzNMNTQgMzNMNTQgMzJMNTYgMzJMNTYgMzFMNTQgMzFMNTQgMzBMNTYgMzBMNTYgMjhMNTcgMjhMNTcgMjNMNTYgMjNMNTYgMjVMNTUgMjVMNTUgMjRMNTQgMjRMNTQgMjVMNTMgMjVMNTMgMjZMNTQgMjZMNTQgMjdMNTIgMjdMNTIgMjVMNTEgMjVMNTEgMjRMNTMgMjRMNTMgMjNMNTEgMjNMNTEgMjRMNDkgMjRMNDkgMjVMNTEgMjVMNTEgMjZMNDkgMjZMNDkgMjdMNDggMjdMNDggMjlMNDcgMjlMNDcgMjVMNDggMjVMNDggMjNMNDkgMjNMNDkgMjJMNDggMjJMNDggMjNMNDcgMjNMNDcgMjRMNDYgMjRMNDYgMjJMNDcgMjJMNDcgMjBMNDggMjBMNDggMTlMNDcgMTlMNDcgMjBMNDUgMjBMNDUgMjJMNDMgMjJMNDMgMjNMNDEgMjNMNDEgMjRMNDQgMjRMNDQgMjNMNDUgMjNMNDUgMjVMNDIgMjVMNDIgMjhMNDMgMjhMNDMgMjZMNDQgMjZMNDQgMjdMNDUgMjdMNDUgMjlMNDcgMjlMNDcgMzBMNDggMzBMNDggMzFMNTAgMzFMNTAgMzJMNDkgMzJMNDkgMzNMNDggMzNMNDggMzRMNDkgMzRMNDkgMzVMNTAgMzVMNTAgMzRMNTEgMzRMNTEgMzNMNTIgMzNMNTIgMzFMNTAgMzFMNTAgMzBMNTIgMzBMNTIgMjlMNTQgMjlMNTQgMzBMNTMgMzBMNTMgMzFMNTQgMzFMNTQgMzJMNTMgMzJMNTMgMzRMNTIgMzRMNTIgMzVMNTEgMzVMNTEgMzZMNTQgMzZMNTQgMzdMNTIgMzdMNTIgNDBMNTEgNDBMNTEgNDFMNTAgNDFMNTAgNDJMNTEgNDJMNTEgNDNMNTIgNDNMNTIgNDRMNTEgNDRMNTEgNDVMNDcgNDVMNDcgNDJMNDggNDJMNDggNDNMNDkgNDNMNDkgNDFMNDggNDFMNDggNDBMNDcgNDBMNDcgMzlMNDYgMzlMNDYgMzhMNDQgMzhMNDQgMzlMNDUgMzlMNDUgNDBMNDYgNDBMNDYgNDFMNDQgNDFMNDQgNDJMNDMgNDJMNDMgNDRMNDQgNDRMNDQgNDJMNDYgNDJMNDYgNDNMNDUgNDNMNDUgNDVMNDYgNDVMNDYgNDZMNDUgNDZMNDUgNDhMNDMgNDhMNDMgNDdMNDQgNDdMNDQgNDZMNDIgNDZMNDIgNDdMMzkgNDdMMzkgNDhMMzggNDhMMzggNDdMMzcgNDdMMzcgNDhMMzggNDhMMzggNDlMMzcgNDlMMzcgNTFMMzYgNTFMMzYgNTBMMzUgNTBMMzUgNDlMMzQgNDlMMzQgNTFMMzYgNTFMMzYgNTRMMzcgNTRMMzcgNTZMMzYgNTZMMzYgNTVMMzUgNTVMMzUgNTJMMzQgNTJMMzQgNTVMMzMgNTVMMzMgNTdMMzQgNTdMMzQgNThMMzMgNThMMzMgNTlMMzQgNTlMMzQgNThMMzUgNThMMzUgNTlMMzcgNTlMMzcgNTZMMzggNTZMMzggNThMMzkgNThMMzkgNTlMMzggNTlMMzggNjBMMzYgNjBMMzYgNjFMMzIgNjFMMzIgNjJMMzAgNjJMMzAgNjNMMzIgNjNMMzIgNjJMMzQgNjJMMzQgNjNMMzggNjNMMzggNjZMMzkgNjZMMzkgNjdMMzggNjdMMzggNjhMMzkgNjhMMzkgNjlMNDAgNjlMNDAgNjhMMzkgNjhMMzkgNjdMNDAgNjdMNDAgNjZMNDEgNjZMNDEgNjRMNDAgNjRMNDAgNjVMMzkgNjVMMzkgNjJMNDIgNjJMNDIgNjNMNDQgNjNMNDQgNjRMNDUgNjRMNDUgNjVMNDIgNjVMNDIgNjZMNDMgNjZMNDMgNjdMNDQgNjdMNDQgNjhMNDIgNjhMNDIgNjdMNDEgNjdMNDEgNzBMNDMgNzBMNDMgNjlMNDQgNjlMNDQgNjhMNDUgNjhMNDUgNjdMNDQgNjdMNDQgNjZMNDYgNjZMNDYgNjRMNDUgNjRMNDUgNjNMNDYgNjNMNDYgNjFMNDcgNjFMNDcgNjBMNDYgNjBMNDYgNThMNDcgNThMNDcgNTZMNDggNTZMNDggNTdMNDkgNTdMNDkgNTZMNDggNTZMNDggNTVMNDkgNTVMNDkgNTNMNDcgNTNMNDcgNTFMNDggNTFMNDggNTJMNDkgNTJMNDkgNTFMNDggNTFMNDggNTBMNDYgNTBMNDYgNDlMNDkgNDlMNDkgNDhMNDcgNDhMNDcgNDdMNDYgNDdMNDYgNDZMNDggNDZMNDggNDdMNTAgNDdMNTAgNDhMNTIgNDhMNTIgNDdMNTMgNDdMNTMgNDlMNTQgNDlMNTQgNDdMNTMgNDdMNTMgNDZMNTQgNDZMNTQgNDVMNTMgNDVMNTMgNDNMNTQgNDNMNTQgNDRMNTUgNDRMNTUgNDNMNTQgNDNMNTQgNDJMNTUgNDJMNTUgNDFMNTYgNDFMNTYgNDJMNTcgNDJMNTcgNDNMNTggNDNMNTggNDJMNTkgNDJMNTkgNDFMNjAgNDFMNjAgNDNMNjEgNDNMNjEgNDJMNjMgNDJMNjMgNDFMNjAgNDFMNjAgMzhMNjMgMzhMNjMgMzZMNjQgMzZMNjQgMzVMNjAgMzVMNjAgMzRMNjIgMzRMNjIgMzNMNjMgMzNMNjMgMzFMNjYgMzFMNjYgMjhMNjQgMjhMNjQgMjlMNjIgMjlMNjIgMjdMNjUgMjdMNjUgMjZMNjQgMjZMNjQgMjVMNjMgMjVMNjMgMjRMNjQgMjRMNjQgMjNMNjUgMjNMNjUgMjJMNjQgMjJMNjQgMjNMNjMgMjNMNjMgMjRMNjIgMjRMNjIgMjNMNjAgMjNMNjAgMjJMNjIgMjJMNjIgMjFMNjMgMjFMNjMgMjBMNjQgMjBMNjQgMTlMNjMgMTlMNjMgMThMNjIgMThMNjIgMTZMNjEgMTZMNjEgMThMNjIgMThMNjIgMTlMNjAgMTlMNjAgMTdMNTkgMTdMNTkgMTZaTTc0IDE2TDc0IDE3TDc1IDE3TDc1IDE2Wk0zMiAxOEwzMiAxOUwzMyAxOUwzMyAxOFpNNjkgMThMNjkgMTlMNzAgMTlMNzAgMThaTTAgMTlMMCAyMEwxIDIwTDEgMjFMMiAyMUwyIDIyTDMgMjJMMyAyM0w0IDIzTDQgMjJMMyAyMkwzIDIxTDIgMjFMMiAxOVpNNjIgMTlMNjIgMjBMNjEgMjBMNjEgMjFMNjIgMjFMNjIgMjBMNjMgMjBMNjMgMTlaTTc1IDE5TDc1IDIwTDc0IDIwTDc0IDIxTDc1IDIxTDc1IDIwTDc2IDIwTDc2IDIxTDc3IDIxTDc3IDIyTDc2IDIyTDc2IDIzTDc3IDIzTDc3IDI0TDc5IDI0TDc5IDI2TDc4IDI2TDc4IDI1TDc3IDI1TDc3IDI2TDc4IDI2TDc4IDI3TDc5IDI3TDc5IDI2TDgxIDI2TDgxIDI0TDc5IDI0TDc5IDIzTDgyIDIzTDgyIDIyTDgxIDIyTDgxIDIxTDgwIDIxTDgwIDIwTDc5IDIwTDc5IDIxTDc3IDIxTDc3IDIwTDc4IDIwTDc4IDE5Wk04MiAxOUw4MiAyMUw4MyAyMUw4MyAyMkw4NCAyMkw4NCAyMUw4MyAyMUw4MyAyMEw4NCAyMEw4NCAxOVpNMTQgMjBMMTQgMjFMMTUgMjFMMTUgMjJMMTQgMjJMMTQgMjNMMTMgMjNMMTMgMjJMMTIgMjJMMTIgMjNMMTMgMjNMMTMgMjVMMTQgMjVMMTQgMjZMMTUgMjZMMTUgMjVMMTYgMjVMMTYgMjRMMTUgMjRMMTUgMjNMMTcgMjNMMTcgMjBaTTU0IDIwTDU0IDIxTDU1IDIxTDU1IDIwWk04OSAyMEw4OSAyMUw5MCAyMUw5MCAyMFpNNiAyMUw2IDIyTDcgMjJMNyAyM0w2IDIzTDYgMjRMNyAyNEw3IDIzTDggMjNMOCAyMkw3IDIyTDcgMjFaTTc5IDIxTDc5IDIyTDgwIDIyTDgwIDIxWk03NyAyMkw3NyAyM0w3OCAyM0w3OCAyMlpNMSAyM0wxIDI0TDIgMjRMMiAyM1pNMTQgMjRMMTQgMjVMMTUgMjVMMTUgMjRaTTU5IDI0TDU5IDI1TDYwIDI1TDYwIDI0Wk02MSAyNEw2MSAyNUw2MiAyNUw2MiAyNkw2MyAyNkw2MyAyNUw2MiAyNUw2MiAyNFpNNjYgMjRMNjYgMjVMNjcgMjVMNjcgMjRaTTAgMjVMMCAyNkwxIDI2TDEgMjdMMCAyN0wwIDI4TDEgMjhMMSAyN0w0IDI3TDQgMjVMMiAyNUwyIDI2TDEgMjZMMSAyNVpNNiAyNUw2IDI2TDcgMjZMNyAyNVpNMjkgMjVMMjkgMjZMMjcgMjZMMjcgMjdMMjggMjdMMjggMjhMMjcgMjhMMjcgMzBMMjggMzBMMjggMjhMMjkgMjhMMjkgMjZMMzAgMjZMMzAgMjVaTTQ1IDI1TDQ1IDI3TDQ2IDI3TDQ2IDI1Wk01NCAyNUw1NCAyNkw1NSAyNkw1NSAyNVpNNjkgMjVMNjkgMjZMNzAgMjZMNzAgMjVaTTkyIDI1TDkyIDI2TDkzIDI2TDkzIDI1Wk0xMCAyNkwxMCAyOEw5IDI4TDkgMzBMMTAgMzBMMTAgMzFMOSAzMUw5IDMyTDEwIDMyTDEwIDMxTDExIDMxTDExIDMwTDEyIDMwTDEyIDMzTDEzIDMzTDEzIDI5TDEyIDI5TDEyIDI3TDExIDI3TDExIDI2Wk0yNCAyNkwyNCAyN0wyNSAyN0wyNSAyOEwyNiAyOEwyNiAyN0wyNSAyN0wyNSAyNlpNNTQgMjdMNTQgMjlMNTUgMjlMNTUgMjhMNTYgMjhMNTYgMjdaTTEwIDI4TDEwIDI5TDExIDI5TDExIDI4Wk00OSAyOEw0OSAyOUw1MCAyOUw1MCAyOFpNNTEgMjhMNTEgMjlMNTIgMjlMNTIgMjhaTTY3IDI4TDY3IDI5TDY5IDI5TDY5IDI4Wk01IDI5TDUgMzJMOCAzMkw4IDI5Wk0yNSAyOUwyNSAzMEwyNCAzMEwyNCAzMUwyNSAzMUwyNSAzMkwyNiAzMkwyNiAzM0wyNyAzM0wyNyAzMkwyOCAzMkwyOCAzMUwyNSAzMUwyNSAzMEwyNiAzMEwyNiAyOVpNMjkgMjlMMjkgMzJMMzIgMzJMMzIgMjlaTTU3IDI5TDU3IDMyTDYwIDMyTDYwIDI5Wk04NSAyOUw4NSAzMkw4OCAzMkw4OCAyOVpNMiAzMEwyIDMxTDMgMzFMMyAzMFpNNiAzMEw2IDMxTDcgMzFMNyAzMFpNMTQgMzBMMTQgMzFMMTUgMzFMMTUgMzBaTTMwIDMwTDMwIDMxTDMxIDMxTDMxIDMwWk01OCAzMEw1OCAzMUw1OSAzMUw1OSAzMFpNODMgMzBMODMgMzFMODIgMzFMODIgMzNMODQgMzNMODQgMzBaTTg2IDMwTDg2IDMxTDg3IDMxTDg3IDMwWk04OSAzMEw4OSAzMkw5MCAzMkw5MCAzM0w5MSAzM0w5MSAzMkw5MCAzMkw5MCAzMFpNNiAzM0w2IDM0TDUgMzRMNSAzNUw2IDM1TDYgMzZMNyAzNkw3IDM1TDkgMzVMOSAzNkw4IDM2TDggMzdMNiAzN0w2IDM4TDUgMzhMNSAzN0w0IDM3TDQgMzhMMiAzOEwyIDQwTDMgNDBMMyA0MUw1IDQxTDUgNDJMNyA0Mkw3IDQxTDYgNDFMNiA0MEwxMCA0MEwxMCAzOUw5IDM5TDkgMzhMOCAzOEw4IDM3TDEwIDM3TDEwIDM4TDExIDM4TDExIDM5TDEyIDM5TDEyIDM4TDExIDM4TDExIDM3TDEwIDM3TDEwIDM1TDEzIDM1TDEzIDM0TDExIDM0TDExIDMzTDkgMzNMOSAzNEw3IDM0TDcgMzNaTTQ5IDMzTDQ5IDM0TDUwIDM0TDUwIDMzWk02IDM0TDYgMzVMNyAzNUw3IDM0Wk05IDM0TDkgMzVMMTAgMzVMMTAgMzRaTTIxIDM0TDIxIDM1TDIyIDM1TDIyIDM0Wk0zMSAzNEwzMSAzNUwzMyAzNUwzMyAzNkwzNCAzNkwzNCAzNFpNODAgMzRMODAgMzVMNzcgMzVMNzcgMzZMNzggMzZMNzggMzdMNzkgMzdMNzkgMzhMODAgMzhMODAgMzdMNzkgMzdMNzkgMzZMODAgMzZMODAgMzVMODEgMzVMODEgMzZMODIgMzZMODIgMzVMODEgMzVMODEgMzRaTTU5IDM1TDU5IDM2TDYwIDM2TDYwIDM3TDYyIDM3TDYyIDM2TDYwIDM2TDYwIDM1Wk04MyAzNUw4MyAzNkw4NSAzNkw4NSAzN0w4MSAzN0w4MSAzOEw4MiAzOEw4MiAzOUw4NCAzOUw4NCA0MEw4NSA0MEw4NSA0Mkw4NiA0Mkw4NiA0M0w4NyA0M0w4NyA0Mkw4OCA0Mkw4OCA0MEw4OSA0MEw4OSAzOUw4OCAzOUw4OCAzN0w4NyAzN0w4NyAzOEw4NiAzOEw4NiAzOUw4NCAzOUw4NCAzOEw4NSAzOEw4NSAzN0w4NiAzN0w4NiAzNVpNODcgMzVMODcgMzZMODggMzZMODggMzVaTTY3IDM2TDY3IDM3TDY4IDM3TDY4IDM2Wk0zMSAzN0wzMSAzOEwzMiAzOEwzMiAzN1pNNTggMzdMNTggMzhMNTkgMzhMNTkgMzdaTTYgMzhMNiAzOUw1IDM5TDUgNDBMNiA0MEw2IDM5TDcgMzlMNyAzOFpNMTcgMzhMMTcgMzlMMTkgMzlMMTkgMzhaTTM5IDM4TDM5IDM5TDQwIDM5TDQwIDM4Wk01MyAzOEw1MyA0MEw1NCA0MEw1NCAzOFpNNzYgMzhMNzYgMzlMNzcgMzlMNzcgNDBMNzggNDBMNzggMzhaTTI3IDM5TDI3IDQwTDI4IDQwTDI4IDQxTDI2IDQxTDI2IDQyTDI4IDQyTDI4IDQxTDI5IDQxTDI5IDQwTDI4IDQwTDI4IDM5Wk0zMSAzOUwzMSA0MkwzMiA0MkwzMiA0MUwzMyA0MUwzMyA0MEwzMiA0MEwzMiAzOVpNNTYgMzlMNTYgNDBMNTcgNDBMNTcgNDJMNTggNDJMNTggNDBMNTkgNDBMNTkgMzlMNTggMzlMNTggNDBMNTcgNDBMNTcgMzlaTTYxIDM5TDYxIDQwTDYyIDQwTDYyIDM5Wk02MyAzOUw2MyA0MEw2NCA0MEw2NCAzOVpNODAgMzlMODAgNDBMODEgNDBMODEgMzlaTTg2IDM5TDg2IDQwTDg3IDQwTDg3IDM5Wk0xOCA0MEwxOCA0MUwxOSA0MUwxOSA0MkwyMCA0MkwyMCA0MUwxOSA0MUwxOSA0MFpNMjQgNDBMMjQgNDFMMjUgNDFMMjUgNDBaTTggNDFMOCA0Mkw5IDQyTDkgNDFaTTEwIDQxTDEwIDQyTDExIDQyTDExIDQxWk0xNiA0MUwxNiA0MkwxNyA0MkwxNyA0MVpNNTEgNDFMNTEgNDJMNTIgNDJMNTIgNDNMNTMgNDNMNTMgNDJMNTIgNDJMNTIgNDFaTTUgNDNMNSA0NEw3IDQ0TDcgNDNaTTggNDNMOCA0NEw5IDQ0TDkgNDNaTTc5IDQzTDc5IDQ0TDgxIDQ0TDgxIDQzWk0yNSA0NEwyNSA0NkwyNyA0NkwyNyA0N0wyNiA0N0wyNiA0OEwyNSA0OEwyNSA0N0wyNCA0N0wyNCA0OEwyMyA0OEwyMyA0OUwyMiA0OUwyMiA1MUwyMSA1MUwyMSA1MkwyMyA1MkwyMyA1MUwyOCA1MUwyOCA0OEwyNyA0OEwyNyA0N0wyOSA0N0wyOSA0NkwyNyA0NkwyNyA0NUwyNiA0NUwyNiA0NFpNMzMgNDRMMzMgNDVMMzQgNDVMMzQgNDRaTTc1IDQ0TDc1IDQ1TDc0IDQ1TDc0IDQ2TDc1IDQ2TDc1IDQ3TDc2IDQ3TDc2IDQ0Wk02IDQ1TDYgNDZMNyA0Nkw3IDQ3TDYgNDdMNiA0OEw3IDQ4TDcgNDdMOCA0N0w4IDQ2TDcgNDZMNyA0NVpNNTEgNDVMNTEgNDZMNTAgNDZMNTAgNDdMNTIgNDdMNTIgNDVaTTU2IDQ1TDU2IDQ2TDU1IDQ2TDU1IDQ5TDU2IDQ5TDU2IDQ4TDU3IDQ4TDU3IDQ1Wk02NiA0NUw2NiA0Nkw2NSA0Nkw2NSA0OEw2MyA0OEw2MyA0OUw2NCA0OUw2NCA1MEw2MyA1MEw2MyA1MUw2NCA1MUw2NCA1Mkw2NSA1Mkw2NSA1MUw2NiA1MUw2NiA1MEw2NyA1MEw2NyA0OUw2NiA0OUw2NiA0Nkw2NyA0Nkw2NyA0NVpNOTIgNDVMOTIgNDZMOTMgNDZMOTMgNDVaTTg0IDQ2TDg0IDQ3TDg1IDQ3TDg1IDQ4TDg3IDQ4TDg3IDQ3TDg1IDQ3TDg1IDQ2Wk04OSA0Nkw4OSA0N0w5MCA0N0w5MCA0NlpNMTIgNDdMMTIgNDhMMTUgNDhMMTUgNDdaTTMwIDQ3TDMwIDQ4TDMxIDQ4TDMxIDQ5TDMyIDQ5TDMyIDUwTDMzIDUwTDMzIDQ4TDMyIDQ4TDMyIDQ3Wk0yNCA0OEwyNCA0OUwyMyA0OUwyMyA1MEwyNiA1MEwyNiA0OUwyNyA0OUwyNyA0OEwyNiA0OEwyNiA0OUwyNSA0OUwyNSA0OFpNMzkgNDhMMzkgNDlMMzggNDlMMzggNTJMNDAgNTJMNDAgNTNMMzkgNTNMMzkgNTVMMzggNTVMMzggNTZMNDAgNTZMNDAgNTdMMzkgNTdMMzkgNThMNDAgNThMNDAgNjBMMzggNjBMMzggNjFMNDEgNjFMNDEgNjBMNDIgNjBMNDIgNjFMNDMgNjFMNDMgNjJMNDQgNjJMNDQgNjNMNDUgNjNMNDUgNjBMNDQgNjBMNDQgNjFMNDMgNjFMNDMgNjBMNDIgNjBMNDIgNThMNDAgNThMNDAgNTdMNDEgNTdMNDEgNTRMNDAgNTRMNDAgNTNMNDEgNTNMNDEgNTJMNDIgNTJMNDIgNTNMNDQgNTNMNDQgNTJMNDYgNTJMNDYgNTBMNDMgNTBMNDMgNTFMNDQgNTFMNDQgNTJMNDIgNTJMNDIgNDlMNDMgNDlMNDMgNDhaTTQ1IDQ4TDQ1IDQ5TDQ2IDQ5TDQ2IDQ4Wk0yOSA0OUwyOSA1MEwzMCA1MEwzMCA1MUwyOSA1MUwyOSA1M0wyOCA1M0wyOCA1MkwyNyA1MkwyNyA1M0wyNiA1M0wyNiA1MkwyNCA1MkwyNCA1NEwyMyA1NEwyMyA1N0wyMiA1N0wyMiA1OEwyMyA1OEwyMyA1N0wyNSA1N0wyNSA1NkwyNCA1NkwyNCA1NEwyNSA1NEwyNSA1M0wyNiA1M0wyNiA1NEwyNyA1NEwyNyA1M0wyOCA1M0wyOCA1NkwzMCA1NkwzMCA1NUwzMiA1NUwzMiA1NEwzMSA1NEwzMSA1M0wzMCA1M0wzMCA1MUwzMSA1MUwzMSA1MEwzMCA1MEwzMCA0OVpNNDAgNDlMNDAgNTBMMzkgNTBMMzkgNTFMNDAgNTFMNDAgNTJMNDEgNTJMNDEgNDlaTTUwIDQ5TDUwIDUyTDUxIDUyTDUxIDUzTDUwIDUzTDUwIDU0TDUxIDU0TDUxIDUzTDUyIDUzTDUyIDUyTDUxIDUyTDUxIDQ5Wk02NSA0OUw2NSA1MEw2NCA1MEw2NCA1MUw2NSA1MUw2NSA1MEw2NiA1MEw2NiA0OVpNMiA1MEwyIDUyTDMgNTJMMyA1MFpNNTMgNTBMNTMgNTNMNTQgNTNMNTQgNTFMNTUgNTFMNTUgNTJMNTYgNTJMNTYgNTFMNTUgNTFMNTUgNTBaTTE0IDUxTDE0IDUyTDE1IDUyTDE1IDUxWk03MyA1MUw3MyA1Mkw3NCA1Mkw3NCA1MVpNNzYgNTFMNzYgNTJMNzcgNTJMNzcgNTNMNzYgNTNMNzYgNTRMNzggNTRMNzggNTVMNzkgNTVMNzkgNTRMODAgNTRMODAgNTJMNzkgNTJMNzkgNTFaTTgyIDUxTDgyIDUyTDg2IDUyTDg2IDUxWk0xMCA1MkwxMCA1M0w5IDUzTDkgNTVMMTAgNTVMMTAgNTNMMTEgNTNMMTEgNTJaTTMyIDUyTDMyIDUzTDMzIDUzTDMzIDUyWk0xOSA1M0wxOSA1NEwxOCA1NEwxOCA1NkwyMSA1NkwyMSA1NUwxOSA1NUwxOSA1NEwyMCA1NEwyMCA1M1pNNDUgNTNMNDUgNTRMNDQgNTRMNDQgNTVMNDMgNTVMNDMgNTRMNDIgNTRMNDIgNTZMNDMgNTZMNDMgNTdMNDQgNTdMNDQgNTVMNDYgNTVMNDYgNTRMNDcgNTRMNDcgNTVMNDggNTVMNDggNTRMNDcgNTRMNDcgNTNaTTc4IDUzTDc4IDU0TDc5IDU0TDc5IDUzWk0yOSA1NEwyOSA1NUwzMCA1NUwzMCA1NFpNODcgNTRMODcgNTVMODYgNTVMODYgNTZMODcgNTZMODcgNTVMODggNTVMODggNTRaTTIgNTVMMiA1NkwzIDU2TDMgNTdMMiA1N0wyIDU4TDMgNThMMyA1N0w0IDU3TDQgNTZMMyA1NkwzIDU1Wk01IDU1TDUgNTZMNyA1Nkw3IDU1Wk0zNCA1NUwzNCA1NkwzNSA1NkwzNSA1NVpNNjIgNTVMNjIgNTZMNjMgNTZMNjMgNTVaTTkxIDU1TDkxIDU2TDkwIDU2TDkwIDU3TDg5IDU3TDg5IDU4TDkwIDU4TDkwIDU3TDkxIDU3TDkxIDU4TDkyIDU4TDkyIDU1Wk0xNSA1NkwxNSA1N0wxNyA1N0wxNyA1NlpNNzUgNTZMNzUgNThMNzYgNThMNzYgNTZaTTgzIDU2TDgzIDU4TDg0IDU4TDg0IDU2Wk01IDU3TDUgNjBMOCA2MEw4IDU3Wk0xOSA1N0wxOSA1OEwyMCA1OEwyMCA1N1pNMjkgNTdMMjkgNjBMMzIgNjBMMzIgNTdaTTM1IDU3TDM1IDU4TDM2IDU4TDM2IDU3Wk01NyA1N0w1NyA2MEw2MCA2MEw2MCA1N1pNNjYgNTdMNjYgNjJMNjcgNjJMNjcgNTdaTTg1IDU3TDg1IDYwTDg4IDYwTDg4IDU3Wk02IDU4TDYgNTlMNyA1OUw3IDU4Wk0xNSA1OEwxNSA1OUwxNiA1OUwxNiA1OFpNMTcgNThMMTcgNTlMMTggNTlMMTggNThaTTMwIDU4TDMwIDU5TDMxIDU5TDMxIDU4Wk01OCA1OEw1OCA1OUw1OSA1OUw1OSA1OFpNNjIgNThMNjIgNTlMNjMgNTlMNjMgNThaTTcyIDU4TDcyIDU5TDczIDU5TDczIDYwTDc1IDYwTDc1IDYxTDc2IDYxTDc2IDYzTDc4IDYzTDc4IDYyTDc5IDYyTDc5IDYxTDc4IDYxTDc4IDU4TDc3IDU4TDc3IDU5TDc2IDU5TDc2IDYwTDc1IDYwTDc1IDU5TDc0IDU5TDc0IDU4Wk04NiA1OEw4NiA1OUw4NyA1OUw4NyA1OFpNNTMgNTlMNTMgNjBMNTQgNjBMNTQgNTlaTTY0IDU5TDY0IDYwTDY1IDYwTDY1IDU5Wk03OSA1OUw3OSA2MEw4MCA2MEw4MCA1OVpNODEgNTlMODEgNjBMODIgNjBMODIgNTlaTTI3IDYxTDI3IDYyTDI5IDYyTDI5IDYxWk03MiA2MUw3MiA2Mkw3MSA2Mkw3MSA2M0w3MCA2M0w3MCA2NUw3MSA2NUw3MSA2NEw3MiA2NEw3MiA2Mkw3MyA2Mkw3MyA2MVpNNzcgNjFMNzcgNjJMNzggNjJMNzggNjFaTTg4IDYxTDg4IDYyTDg5IDYyTDg5IDYxWk0xNiA2MkwxNiA2M0wxNyA2M0wxNyA2MlpNMjMgNjJMMjMgNjNMMjQgNjNMMjQgNjRMMjUgNjRMMjUgNjNMMjYgNjNMMjYgNjJaTTU3IDYyTDU3IDYzTDU4IDYzTDU4IDYyWk02OCA2Mkw2OCA2M0w2NSA2M0w2NSA2NEw2MyA2NEw2MyA2NUw2MSA2NUw2MSA2N0w2MiA2N0w2MiA2OEw2MSA2OEw2MSA2OUw2MiA2OUw2MiA2OEw2MyA2OEw2MyA2OUw2NCA2OUw2NCA3Mkw2MyA3Mkw2MyA3M0w2NCA3M0w2NCA3Mkw2NSA3Mkw2NSA3MUw2NyA3MUw2NyA3Mkw2NiA3Mkw2NiA3M0w2NyA3M0w2NyA3Mkw2OCA3Mkw2OCA3M0w2OSA3M0w2OSA3Mkw2OCA3Mkw2OCA3MUw2OSA3MUw2OSA3MEw3MCA3MEw3MCA3Mkw3MiA3Mkw3MiA3MUw3MSA3MUw3MSA3MEw3MyA3MEw3MyA2OUw3MSA2OUw3MSA2OEw3MiA2OEw3MiA2N0w3MyA2N0w3MyA2Nkw3MiA2Nkw3MiA2N0w3MSA2N0w3MSA2Nkw2OSA2Nkw2OSA2NEw2OCA2NEw2OCA2M0w2OSA2M0w2OSA2MlpNMTAgNjNMMTAgNjRMOSA2NEw5IDY2TDggNjZMOCA2NEw2IDY0TDYgNjVMNyA2NUw3IDY2TDYgNjZMNiA2N0w3IDY3TDcgNjhMOSA2OEw5IDY5TDcgNjlMNyA3MEw1IDcwTDUgNzFMOCA3MUw4IDcyTDYgNzJMNiA3M0w0IDczTDQgNzJMMyA3MkwzIDczTDQgNzNMNCA3NEw2IDc0TDYgNzVMNyA3NUw3IDc2TDYgNzZMNiA3N0w3IDc3TDcgNzZMOSA3Nkw5IDc3TDEwIDc3TDEwIDgwTDExIDgwTDExIDgxTDEyIDgxTDEyIDgwTDExIDgwTDExIDc3TDEyIDc3TDEyIDc2TDEwIDc2TDEwIDc0TDggNzRMOCA3NUw3IDc1TDcgNzRMNiA3NEw2IDczTDEyIDczTDEyIDc0TDEzIDc0TDEzIDczTDEyIDczTDEyIDcyTDEzIDcyTDEzIDcwTDExIDcwTDExIDY5TDEyIDY5TDEyIDY4TDE0IDY4TDE0IDY5TDE1IDY5TDE1IDY3TDEzIDY3TDEzIDY2TDEyIDY2TDEyIDY0TDExIDY0TDExIDYzWk0yMSA2M0wyMSA2NUwyMiA2NUwyMiA2M1pNNzkgNjNMNzkgNjRMNzggNjRMNzggNjVMNzkgNjVMNzkgNjRMODAgNjRMODAgNjdMODEgNjdMODEgNjZMODIgNjZMODIgNjVMODEgNjVMODEgNjRMODIgNjRMODIgNjNaTTEwIDY0TDEwIDY1TDExIDY1TDExIDY0Wk0zNSA2NEwzNSA2NUwzNiA2NUwzNiA2NFpNNDggNjRMNDggNjVMNDkgNjVMNDkgNjRaTTY1IDY0TDY1IDY1TDYzIDY1TDYzIDY2TDY0IDY2TDY0IDY4TDY1IDY4TDY1IDcwTDY2IDcwTDY2IDY5TDY3IDY5TDY3IDcxTDY4IDcxTDY4IDcwTDY5IDcwTDY5IDY5TDcwIDY5TDcwIDcwTDcxIDcwTDcxIDY5TDcwIDY5TDcwIDY4TDcxIDY4TDcxIDY3TDY5IDY3TDY5IDY2TDY4IDY2TDY4IDY0TDY3IDY0TDY3IDY1TDY2IDY1TDY2IDY0Wk04MyA2NUw4MyA2Nkw4NSA2Nkw4NSA2NVpNNyA2Nkw3IDY3TDggNjdMOCA2NlpNMTEgNjZMMTEgNjdMMTAgNjdMMTAgNjlMOSA2OUw5IDcwTDggNzBMOCA3MUwxMCA3MUwxMCA3MkwxMSA3MkwxMSA3MUwxMCA3MUwxMCA2OUwxMSA2OUwxMSA2N0wxMiA2N0wxMiA2NlpNMzYgNjZMMzYgNjdMMzcgNjdMMzcgNjZaTTY1IDY2TDY1IDY4TDY2IDY4TDY2IDY2Wk02NyA2Nkw2NyA2OEw2OSA2OEw2OSA2N0w2OCA2N0w2OCA2NlpNMzAgNjdMMzAgNjhMMzEgNjhMMzEgNjdaTTgyIDY3TDgyIDY5TDgxIDY5TDgxIDY4TDgwIDY4TDgwIDY5TDgxIDY5TDgxIDcwTDgwIDcwTDgwIDcxTDc5IDcxTDc5IDcyTDgwIDcyTDgwIDcxTDgxIDcxTDgxIDcwTDgyIDcwTDgyIDcyTDgzIDcyTDgzIDcwTDg0IDcwTDg0IDY5TDg2IDY5TDg2IDY4TDg1IDY4TDg1IDY3TDg0IDY3TDg0IDY5TDgzIDY5TDgzIDY3Wk0xOSA2OEwxOSA3MEwyMCA3MEwyMCA2OUwyMSA2OUwyMSA2OFpNMjcgNjhMMjcgNjlMMjggNjlMMjggNjhaTTU5IDY4TDU5IDY5TDU4IDY5TDU4IDcwTDU3IDcwTDU3IDcyTDU2IDcyTDU2IDcwTDU1IDcwTDU1IDcyTDU0IDcyTDU0IDcxTDUzIDcxTDUzIDcyTDU0IDcyTDU0IDc0TDUzIDc0TDUzIDc2TDU2IDc2TDU2IDc3TDU0IDc3TDU0IDc4TDU1IDc4TDU1IDgwTDU3IDgwTDU3IDc5TDU4IDc5TDU4IDc4TDU5IDc4TDU5IDc2TDYwIDc2TDYwIDc4TDYxIDc4TDYxIDc3TDYyIDc3TDYyIDc4TDYzIDc4TDYzIDc3TDY0IDc3TDY0IDc2TDYzIDc2TDYzIDc1TDY0IDc1TDY0IDc0TDYzIDc0TDYzIDc1TDYyIDc1TDYyIDczTDYwIDczTDYwIDcyTDYxIDcyTDYxIDcxTDYzIDcxTDYzIDcwTDYwIDcwTDYwIDY4Wk05MCA2OEw5MCA2OUw4OCA2OUw4OCA3MEw4OSA3MEw4OSA3Mkw5MCA3Mkw5MCA2OUw5MSA2OUw5MSA2OFpNNTEgNjlMNTEgNzBMNTIgNzBMNTIgNjlaTTgyIDY5TDgyIDcwTDgzIDcwTDgzIDY5Wk0xNCA3MEwxNCA3MUwxNSA3MUwxNSA3M0wxNCA3M0wxNCA3NEwxNSA3NEwxNSA3M0wxNiA3M0wxNiA3MkwyMSA3MkwyMSA3MUwxNyA3MUwxNyA3MFpNNTggNzBMNTggNzJMNTcgNzJMNTcgNzNMNTYgNzNMNTYgNzJMNTUgNzJMNTUgNzNMNTYgNzNMNTYgNzRMNTcgNzRMNTcgNzZMNTkgNzZMNTkgNzRMNTggNzRMNTggNzJMNjAgNzJMNjAgNzBaTTg0IDcxTDg0IDczTDgzIDczTDgzIDc0TDg0IDc0TDg0IDczTDg1IDczTDg1IDc0TDg3IDc0TDg3IDczTDg1IDczTDg1IDcxWk0yNCA3MkwyNCA3NUwyMiA3NUwyMiA3NkwyMyA3NkwyMyA3N0wyNCA3N0wyNCA3NUwyNSA3NUwyNSA3MlpNNzYgNzJMNzYgNzRMNzggNzRMNzggNzNMNzcgNzNMNzcgNzJaTTQxIDczTDQxIDc0TDQwIDc0TDQwIDc2TDQxIDc2TDQxIDc3TDQzIDc3TDQzIDc2TDQxIDc2TDQxIDc0TDQyIDc0TDQyIDczWk00OSA3M0w0OSA3NEw0OCA3NEw0OCA3Nkw1MCA3Nkw1MCA3NUw0OSA3NUw0OSA3NEw1MCA3NEw1MCA3M1pNNzEgNzNMNzEgNzRMNzMgNzRMNzMgNzNaTTgwIDczTDgwIDc0TDgyIDc0TDgyIDczWk00MyA3NEw0MyA3NUw0NCA3NUw0NCA3NFpNMSA3NUwxIDc2TDAgNzZMMCA3OUwxIDc5TDEgNzZMMiA3NkwyIDc1Wk02MCA3NUw2MCA3Nkw2MiA3Nkw2MiA3NVpNNzUgNzVMNzUgNzZMNzYgNzZMNzYgNzVaTTgwIDc1TDgwIDc2TDgxIDc2TDgxIDc4TDgyIDc4TDgyIDc5TDgzIDc5TDgzIDc2TDg0IDc2TDg0IDc3TDg1IDc3TDg1IDc1TDgzIDc1TDgzIDc2TDgyIDc2TDgyIDc1Wk0yNSA3NkwyNSA3N0wyNyA3N0wyNyA3NlpNMzIgNzZMMzIgNzdMMzMgNzdMMzMgNzZaTTQ1IDc2TDQ1IDc3TDQ2IDc3TDQ2IDc2Wk00OCA3N0w0OCA3OEw0OSA3OEw0OSA3N1pNNTcgNzdMNTcgNzhMNTYgNzhMNTYgNzlMNTcgNzlMNTcgNzhMNTggNzhMNTggNzdaTTIyIDc4TDIyIDc5TDI1IDc5TDI1IDc4Wk00MyA3OEw0MyA3OUw0NCA3OUw0NCA3OFpNOCA3OUw4IDgwTDkgODBMOSA3OVpNNjIgNzlMNjIgODBMNjMgODBMNjMgODFMNjUgODFMNjUgODJMNjcgODJMNjcgODFMNjYgODFMNjYgODBMNjggODBMNjggNzlMNjQgNzlMNjQgODBMNjMgODBMNjMgNzlaTTMwIDgwTDMwIDgxTDI4IDgxTDI4IDgzTDMwIDgzTDMwIDg0TDMxIDg0TDMxIDgzTDMwIDgzTDMwIDgxTDMxIDgxTDMxIDgyTDMzIDgyTDMzIDgwWk00MyA4MEw0MyA4MUw0MiA4MUw0MiA4Mkw0MSA4Mkw0MSA4M0w0MiA4M0w0MiA4NEw0MyA4NEw0MyA4M0w0MiA4M0w0MiA4Mkw0MyA4Mkw0MyA4MUw0NCA4MUw0NCA4MFpNNDggODBMNDggODFMNDkgODFMNDkgODBaTTQ2IDgxTDQ2IDgyTDQ1IDgyTDQ1IDgzTDQ2IDgzTDQ2IDgyTDQ3IDgyTDQ3IDgxWk0yMCA4MkwyMCA4M0wyMSA4M0wyMSA4MlpNNTQgODJMNTQgODNMNTUgODNMNTUgODJaTTYzIDgyTDYzIDgzTDY0IDgzTDY0IDgyWk03MyA4Mkw3MyA4NEw3NSA4NEw3NSA4M0w3NCA4M0w3NCA4MlpNNzEgODNMNzEgODRMNzIgODRMNzIgODNaTTgwIDgzTDgwIDg0TDgyIDg0TDgyIDgzWk0yNyA4NEwyNyA4NUwyNSA4NUwyNSA4NkwyNCA4NkwyNCA4N0wyMyA4N0wyMyA4NkwyMiA4NkwyMiA4N0wyMyA4N0wyMyA4OEwyNCA4OEwyNCA4N0wyNiA4N0wyNiA4NkwyOCA4NkwyOCA4NFpNMzUgODRMMzUgODVMMzYgODVMMzYgODRaTTYzIDg0TDYzIDg1TDYyIDg1TDYyIDg3TDYzIDg3TDYzIDg1TDY0IDg1TDY0IDg0Wk03OCA4NEw3OCA4NUw3OSA4NUw3OSA4NFpNMTUgODVMMTUgODZMMTYgODZMMTYgODVaTTI5IDg1TDI5IDg4TDMyIDg4TDMyIDg1Wk01NyA4NUw1NyA4OEw2MCA4OEw2MCA4NVpNNjkgODVMNjkgODZMNzAgODZMNzAgODdMNjkgODdMNjkgODhMNjggODhMNjggODlMNjkgODlMNjkgODhMNzMgODhMNzMgODlMNzQgODlMNzQgODhMNzMgODhMNzMgODdMNzQgODdMNzQgODZMNzIgODZMNzIgODdMNzEgODdMNzEgODZMNzAgODZMNzAgODVaTTg1IDg1TDg1IDg4TDg4IDg4TDg4IDg1Wk0zMCA4NkwzMCA4N0wzMSA4N0wzMSA4NlpNMzYgODZMMzYgODdMMzcgODdMMzcgODZaTTU4IDg2TDU4IDg3TDU5IDg3TDU5IDg2Wk02NCA4Nkw2NCA4OEw2NSA4OEw2NSA4OUw2NyA4OUw2NyA4N0w2NiA4N0w2NiA4OEw2NSA4OEw2NSA4NlpNODYgODZMODYgODdMODcgODdMODcgODZaTTExIDg3TDExIDg4TDggODhMOCA5MUw5IDkxTDkgOTBMMTAgOTBMMTAgODlMMTEgODlMMTEgOTBMMTIgOTBMMTIgODdaTTI3IDg3TDI3IDg5TDI4IDg5TDI4IDkwTDMwIDkwTDMwIDkyTDMxIDkyTDMxIDkwTDMwIDkwTDMwIDg5TDI4IDg5TDI4IDg3Wk0xNyA4OEwxNyA4OUwxOCA4OUwxOCA4OFpNNTEgODhMNTEgODlMNTIgODlMNTIgODhaTTMyIDg5TDMyIDkxTDM0IDkxTDM0IDkyTDM1IDkyTDM1IDkxTDM0IDkxTDM0IDg5Wk00MCA4OUw0MCA5MUw0MSA5MUw0MSA5MEw0MiA5MEw0MiA4OVpNNDQgODlMNDQgOTBMNDMgOTBMNDMgOTFMNDQgOTFMNDQgOTBMNDUgOTBMNDUgOTFMNDYgOTFMNDYgOTBMNDUgOTBMNDUgODlaTTg2IDg5TDg2IDkwTDg3IDkwTDg3IDg5Wk0xOCA5MEwxOCA5MUwxNiA5MUwxNiA5M0wxNyA5M0wxNyA5MkwxOCA5MkwxOCA5M0wxOSA5M0wxOSA5MFpNNTIgOTBMNTIgOTNMNTMgOTNMNTMgOTJMNTUgOTJMNTUgOTFMNTMgOTFMNTMgOTBaTTY1IDkwTDY1IDkxTDY2IDkxTDY2IDkwWk00OCA5MUw0OCA5Mkw0OSA5Mkw0OSA5MVpNMCAwTDAgN0w3IDdMNyAwWk0xIDFMMSA2TDYgNkw2IDFaTTIgMkwyIDVMNSA1TDUgMlpNODYgMEw4NiA3TDkzIDdMOTMgMFpNODcgMUw4NyA2TDkyIDZMOTIgMVpNODggMkw4OCA1TDkxIDVMOTEgMlpNMCA4NkwwIDkzTDcgOTNMNyA4NlpNMSA4N0wxIDkyTDYgOTJMNiA4N1pNMiA4OEwyIDkxTDUgOTFMNSA4OFoiIGZpbGw9IiMwMDAwMDAiLz48L2c+PC9nPjwvc3ZnPgo=	data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyIgPz4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+DQo8c3ZnIHdpZHRoPSIyMzciIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCAyMzcgODAiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCgk8ZGVzYz4wMDAwMDAwODwvZGVzYz4NCgk8ZyBpZD0iYmFycyIgZmlsbD0icmdiKDAsMCwwKSIgc3Ryb2tlPSJub25lIj4NCgkJPHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjYiIGhlaWdodD0iODAiIC8+DQoJCTxyZWN0IHg9IjkiIHk9IjAiIHdpZHRoPSIzIiBoZWlnaHQ9IjgwIiAvPg0KCQk8cmVjdCB4PSIxOCIgeT0iMCIgd2lkdGg9IjkiIGhlaWdodD0iODAiIC8+DQoJCTxyZWN0IHg9IjMzIiB5PSIwIiB3aWR0aD0iNiIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iNDIiIHk9IjAiIHdpZHRoPSI2IiBoZWlnaHQ9IjgwIiAvPg0KCQk8cmVjdCB4PSI1NCIgeT0iMCIgd2lkdGg9IjYiIGhlaWdodD0iODAiIC8+DQoJCTxyZWN0IHg9IjY2IiB5PSIwIiB3aWR0aD0iNiIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iNzUiIHk9IjAiIHdpZHRoPSI2IiBoZWlnaHQ9IjgwIiAvPg0KCQk8cmVjdCB4PSI4NyIgeT0iMCIgd2lkdGg9IjYiIGhlaWdodD0iODAiIC8+DQoJCTxyZWN0IHg9Ijk5IiB5PSIwIiB3aWR0aD0iNiIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMTA4IiB5PSIwIiB3aWR0aD0iNiIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMTIwIiB5PSIwIiB3aWR0aD0iNiIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMTMyIiB5PSIwIiB3aWR0aD0iMyIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMTQ0IiB5PSIwIiB3aWR0aD0iNiIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMTU2IiB5PSIwIiB3aWR0aD0iMyIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMTY1IiB5PSIwIiB3aWR0aD0iMyIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMTc3IiB5PSIwIiB3aWR0aD0iMyIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMTgzIiB5PSIwIiB3aWR0aD0iNiIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMTk4IiB5PSIwIiB3aWR0aD0iNiIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMjEzIiB5PSIwIiB3aWR0aD0iOSIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMjI1IiB5PSIwIiB3aWR0aD0iMyIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMjMxIiB5PSIwIiB3aWR0aD0iNiIgaGVpZ2h0PSI4MCIgLz4NCgk8L2c+DQo8L3N2Zz4NCg==
1	ASUS gaming	2	Asus	dad2244	14808.22	44524455	2025-12-15	15000	2029-06-14	3	1	1	\N	1	2025-12-15 02:58:23	2025-12-29 01:50:26	data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZlcnNpb249IjEuMSIgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIHZpZXdCb3g9IjAgMCAzMDAgMzAwIj48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2ZmZmZmZiIvPjxnIHRyYW5zZm9ybT0ic2NhbGUoNS4yNjMpIj48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgwLDApIj48cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik04IDBMOCAzTDEwIDNMMTAgMUwxMSAxTDExIDJMMTIgMkwxMiAxTDEzIDFMMTMgMkwxNCAyTDE0IDNMMTIgM0wxMiA1TDEzIDVMMTMgNkwxMiA2TDEyIDhMMTMgOEwxMyA5TDEwIDlMMTAgOEwxMSA4TDExIDRMOSA0TDkgNUw4IDVMOCA5TDEwIDlMMTAgMTFMMTIgMTFMMTIgMTJMOSAxMkw5IDExTDggMTFMOCAxMkw0IDEyTDQgOUw1IDlMNSA4TDIgOEwyIDEwTDAgMTBMMCAxMkwyIDEyTDIgMTNMMSAxM0wxIDE2TDAgMTZMMCAxOUwxIDE5TDEgMjRMMiAyNEwyIDI2TDEgMjZMMSAyNUwwIDI1TDAgMjdMMSAyN0wxIDI5TDAgMjlMMCAzM0wxIDMzTDEgMzVMMCAzNUwwIDM2TDEgMzZMMSAzNUwyIDM1TDIgMzNMMyAzM0wzIDM4TDQgMzhMNCAzOUwzIDM5TDMgNDBMNCA0MEw0IDQxTDIgNDFMMiAzOUwxIDM5TDEgNDBMMCA0MEwwIDQyTDQgNDJMNCA0MUw1IDQxTDUgNDNMMiA0M0wyIDQ1TDMgNDVMMyA0NkwyIDQ2TDIgNDdMMSA0N0wxIDQ2TDAgNDZMMCA0OEw1IDQ4TDUgNDdMNyA0N0w3IDQ4TDYgNDhMNiA0OUw3IDQ5TDcgNDhMOSA0OEw5IDQ2TDYgNDZMNiA0NUw3IDQ1TDcgNDRMOCA0NEw4IDQ1TDkgNDVMOSA0NEwxMSA0NEwxMSA0M0wxMyA0M0wxMyA0MkwxMCA0MkwxMCA0MUwxMiA0MUwxMiA0MEwxMSA0MEwxMSAzOUwxNCAzOUwxNCA0MEwxNSA0MEwxNSA0MUwxNCA0MUwxNCA0MkwxNSA0MkwxNSA0NUwxNCA0NUwxNCA0NkwxMyA0NkwxMyA0NUwxMSA0NUwxMSA0NkwxMiA0NkwxMiA0N0wxMCA0N0wxMCA0OEwxMiA0OEwxMiA0OUwxMSA0OUwxMSA1MEw5IDUwTDkgNDlMOCA0OUw4IDUwTDkgNTBMOSA1Mkw4IDUyTDggNTVMOSA1NUw5IDU3TDEyIDU3TDEyIDU2TDEwIDU2TDEwIDUzTDExIDUzTDExIDUwTDEzIDUwTDEzIDUxTDEyIDUxTDEyIDUyTDE0IDUyTDE0IDUzTDEyIDUzTDEyIDU0TDE0IDU0TDE0IDUzTDE1IDUzTDE1IDUyTDE3IDUyTDE3IDUwTDE1IDUwTDE1IDQ5TDEzIDQ5TDEzIDQ4TDE0IDQ4TDE0IDQ2TDE1IDQ2TDE1IDQ3TDE2IDQ3TDE2IDQ5TDE3IDQ5TDE3IDQ4TDE4IDQ4TDE4IDQ5TDE5IDQ5TDE5IDUwTDE4IDUwTDE4IDUxTDE5IDUxTDE5IDUwTDIwIDUwTDIwIDUxTDIxIDUxTDIxIDUzTDIwIDUzTDIwIDUyTDE4IDUyTDE4IDU0TDE5IDU0TDE5IDU1TDIwIDU1TDIwIDU0TDIxIDU0TDIxIDU2TDE5IDU2TDE5IDU3TDI1IDU3TDI1IDU2TDI3IDU2TDI3IDU3TDI5IDU3TDI5IDU1TDMwIDU1TDMwIDU2TDMzIDU2TDMzIDU0TDM0IDU0TDM0IDU2TDM1IDU2TDM1IDU1TDM2IDU1TDM2IDU3TDQwIDU3TDQwIDU2TDQxIDU2TDQxIDU1TDQwIDU1TDQwIDU0TDM3IDU0TDM3IDUxTDM2IDUxTDM2IDQ4TDM3IDQ4TDM3IDQ5TDM4IDQ5TDM4IDQ4TDM5IDQ4TDM5IDQ3TDQyIDQ3TDQyIDQ4TDQxIDQ4TDQxIDQ5TDQyIDQ5TDQyIDUwTDQzIDUwTDQzIDQ5TDQyIDQ5TDQyIDQ4TDQzIDQ4TDQzIDQ3TDQyIDQ3TDQyIDQ2TDQ0IDQ2TDQ0IDQ0TDQ1IDQ0TDQ1IDQ2TDQ2IDQ2TDQ2IDQ3TDQ0IDQ3TDQ0IDQ4TDQ1IDQ4TDQ1IDUxTDQ0IDUxTDQ0IDUyTDQzIDUyTDQzIDUxTDQyIDUxTDQyIDUyTDQxIDUyTDQxIDUxTDQwIDUxTDQwIDUyTDQxIDUyTDQxIDUzTDQyIDUzTDQyIDU0TDQzIDU0TDQzIDU1TDQyIDU1TDQyIDU2TDQzIDU2TDQzIDU1TDQ0IDU1TDQ0IDU2TDQ1IDU2TDQ1IDU3TDQ5IDU3TDQ5IDU1TDUyIDU1TDUyIDU2TDUwIDU2TDUwIDU3TDUzIDU3TDUzIDU2TDU1IDU2TDU1IDU3TDU2IDU3TDU2IDU2TDU1IDU2TDU1IDUzTDU2IDUzTDU2IDUwTDU3IDUwTDU3IDQ5TDU2IDQ5TDU2IDQ4TDU3IDQ4TDU3IDQ3TDU2IDQ3TDU2IDQ2TDU3IDQ2TDU3IDQzTDU2IDQzTDU2IDQyTDU3IDQyTDU3IDQxTDU2IDQxTDU2IDQwTDU1IDQwTDU1IDM4TDU3IDM4TDU3IDM1TDU2IDM1TDU2IDM3TDUzIDM3TDUzIDM2TDU1IDM2TDU1IDM0TDU0IDM0TDU0IDMzTDUzIDMzTDUzIDMyTDU1IDMyTDU1IDMxTDU2IDMxTDU2IDMyTDU3IDMyTDU3IDMxTDU2IDMxTDU2IDMwTDU3IDMwTDU3IDI3TDU2IDI3TDU2IDI2TDU3IDI2TDU3IDI1TDU2IDI1TDU2IDI2TDU1IDI2TDU1IDI1TDUzIDI1TDUzIDI2TDUwIDI2TDUwIDI1TDUxIDI1TDUxIDI0TDQ5IDI0TDQ5IDIzTDQ4IDIzTDQ4IDI0TDQ5IDI0TDQ5IDI1TDQ4IDI1TDQ4IDI2TDQ2IDI2TDQ2IDI1TDQ3IDI1TDQ3IDI0TDQ2IDI0TDQ2IDIzTDQ3IDIzTDQ3IDIyTDQ2IDIyTDQ2IDIwTDQ3IDIwTDQ3IDE4TDQ2IDE4TDQ2IDE3TDQ3IDE3TDQ3IDE2TDQ2IDE2TDQ2IDE1TDQ4IDE1TDQ4IDE2TDQ5IDE2TDQ5IDE1TDQ4IDE1TDQ4IDE0TDUwIDE0TDUwIDE1TDUxIDE1TDUxIDE2TDUwIDE2TDUwIDE3TDQ4IDE3TDQ4IDE4TDUwIDE4TDUwIDE5TDQ4IDE5TDQ4IDIwTDU1IDIwTDU1IDIxTDUxIDIxTDUxIDIyTDUwIDIyTDUwIDIzTDUxIDIzTDUxIDIyTDUyIDIyTDUyIDI0TDU1IDI0TDU1IDIzTDU2IDIzTDU2IDIyTDU3IDIyTDU3IDIxTDU2IDIxTDU2IDIwTDU1IDIwTDU1IDE5TDU2IDE5TDU2IDE3TDU1IDE3TDU1IDE2TDU2IDE2TDU2IDE0TDU3IDE0TDU3IDExTDU2IDExTDU2IDEwTDU3IDEwTDU3IDhMNTQgOEw1NCA5TDUzIDlMNTMgMTFMNTIgMTFMNTIgMTBMNTAgMTBMNTAgOUw1MiA5TDUyIDhMNDkgOEw0OSA5TDQ3IDlMNDcgOEw0NiA4TDQ2IDdMNDcgN0w0NyA1TDQ4IDVMNDggMEw0NiAwTDQ2IDFMNDUgMUw0NSAyTDQ0IDJMNDQgM0w0NSAzTDQ1IDRMNDYgNEw0NiAzTDQ3IDNMNDcgNUw0MyA1TDQzIDFMNDQgMUw0NCAwTDQxIDBMNDEgMUw0MCAxTDQwIDBMMzkgMEwzOSAxTDM4IDFMMzggMkwzNyAyTDM3IDFMMzYgMUwzNiAwTDMzIDBMMzMgMUwzMiAxTDMyIDBMMzEgMEwzMSAxTDMyIDFMMzIgMkwyOSAyTDI5IDRMMjYgNEwyNiAzTDI4IDNMMjggMEwyNyAwTDI3IDJMMjYgMkwyNiAwTDI1IDBMMjUgMkwyNCAyTDI0IDVMMjMgNUwyMyAyTDIyIDJMMjIgM0wyMSAzTDIxIDFMMjIgMUwyMiAwTDE0IDBMMTQgMUwxMyAxTDEzIDBMMTIgMEwxMiAxTDExIDFMMTEgMFpNMjMgMEwyMyAxTDI0IDFMMjQgMFpNMTQgMUwxNCAyTDE1IDJMMTUgM0wxNCAzTDE0IDZMMTMgNkwxMyA3TDE0IDdMMTQgOUwxMyA5TDEzIDEyTDEyIDEyTDEyIDEzTDkgMTNMOSAxMkw4IDEyTDggMTNMNSAxM0w1IDE1TDYgMTVMNiAxNkw0IDE2TDQgMTVMMiAxNUwyIDE3TDEgMTdMMSAxOUwzIDE5TDMgMjFMNCAyMUw0IDE5TDMgMTlMMyAxOEw0IDE4TDQgMTdMNiAxN0w2IDE4TDcgMThMNyAxOUw2IDE5TDYgMjBMNSAyMEw1IDIxTDYgMjFMNiAyMkw4IDIyTDggMjFMNiAyMUw2IDIwTDggMjBMOCAxOUw5IDE5TDkgMThMMTAgMThMMTAgMTdMMTEgMTdMMTEgMTZMMTMgMTZMMTMgMTdMMTQgMTdMMTQgMThMMTIgMThMMTIgMTlMMTEgMTlMMTEgMjJMMTIgMjJMMTIgMjNMMTMgMjNMMTMgMjRMMTIgMjRMMTIgMjVMMTAgMjVMMTAgMjRMMTEgMjRMMTEgMjNMMTAgMjNMMTAgMjJMOSAyMkw5IDIzTDYgMjNMNiAyNEw1IDI0TDUgMjNMNCAyM0w0IDIyTDIgMjJMMiAyNEwzIDI0TDMgMjVMNCAyNUw0IDI0TDUgMjRMNSAyNkw3IDI2TDcgMjVMOSAyNUw5IDI2TDEyIDI2TDEyIDI1TDEzIDI1TDEzIDI2TDE0IDI2TDE0IDI3TDEyIDI3TDEyIDI4TDEwIDI4TDEwIDI3TDkgMjdMOSAzMEwxMCAzMEwxMCAzMUw5IDMxTDkgMzJMMTEgMzJMMTEgMzFMMTIgMzFMMTIgMzBMMTEgMzBMMTEgMjlMMTMgMjlMMTMgMjhMMTggMjhMMTggMjlMMTkgMjlMMTkgMjdMMjEgMjdMMjEgMjlMMjMgMjlMMjMgMzBMMjQgMzBMMjQgMjlMMjMgMjlMMjMgMjdMMjQgMjdMMjQgMjhMMjYgMjhMMjYgMjZMMjcgMjZMMjcgMjVMMjggMjVMMjggMjZMMjkgMjZMMjkgMjVMMzIgMjVMMzIgMjdMMzEgMjdMMzEgMzBMMzIgMzBMMzIgMzNMMzEgMzNMMzEgMzJMMzAgMzJMMzAgMzFMMjggMzFMMjggMzJMMjkgMzJMMjkgMzNMMjcgMzNMMjcgMzJMMjMgMzJMMjMgMzNMMjcgMzNMMjcgMzRMMjkgMzRMMjkgMzVMMjcgMzVMMjcgMzZMMjkgMzZMMjkgMzVMMzAgMzVMMzAgMzZMMzEgMzZMMzEgMzlMMzAgMzlMMzAgNDBMMjkgNDBMMjkgMzhMMzAgMzhMMzAgMzdMMjggMzdMMjggMzhMMjcgMzhMMjcgMzlMMjggMzlMMjggNDBMMjkgNDBMMjkgNDJMMzAgNDJMMzAgNDNMMzEgNDNMMzEgNDRMMjcgNDRMMjcgNDVMMjYgNDVMMjYgNDRMMjUgNDRMMjUgNDNMMjggNDNMMjggNDFMMjcgNDFMMjcgNDBMMjYgNDBMMjYgMzlMMjUgMzlMMjUgNDBMMjQgNDBMMjQgMzlMMjMgMzlMMjMgMzhMMjQgMzhMMjQgMzdMMjUgMzdMMjUgMzhMMjYgMzhMMjYgMzdMMjUgMzdMMjUgMzZMMjYgMzZMMjYgMzVMMjUgMzVMMjUgMzRMMjMgMzRMMjMgMzVMMjIgMzVMMjIgMzJMMjAgMzJMMjAgMzFMMjEgMzFMMjEgMzBMMjAgMzBMMjAgMzFMMTkgMzFMMTkgMzRMMjAgMzRMMjAgMzVMMTUgMzVMMTUgMzRMMTQgMzRMMTQgMzJMMTUgMzJMMTUgMzNMMTYgMzNMMTYgMzRMMTcgMzRMMTcgMzNMMTggMzNMMTggMzJMMTcgMzJMMTcgMjlMMTUgMjlMMTUgMzBMMTYgMzBMMTYgMzFMMTQgMzFMMTQgMzJMMTIgMzJMMTIgMzNMMTMgMzNMMTMgMzRMMTIgMzRMMTIgMzVMMTMgMzVMMTMgMzRMMTQgMzRMMTQgMzZMMTUgMzZMMTUgMzdMMTYgMzdMMTYgMzlMMTcgMzlMMTcgMzdMMTggMzdMMTggNDBMMTkgNDBMMTkgNDFMMTcgNDFMMTcgNDBMMTYgNDBMMTYgNDFMMTUgNDFMMTUgNDJMMTYgNDJMMTYgNDFMMTcgNDFMMTcgNDRMMTYgNDRMMTYgNDdMMTcgNDdMMTcgNDZMMjEgNDZMMjEgNDdMMjAgNDdMMjAgNDhMMjMgNDhMMjMgNTBMMjIgNTBMMjIgNTJMMjMgNTJMMjMgNTBMMjQgNTBMMjQgNDdMMjUgNDdMMjUgNDZMMjYgNDZMMjYgNDdMMjcgNDdMMjcgNDZMMzEgNDZMMzEgNDdMMzAgNDdMMzAgNDhMMzEgNDhMMzEgNDdMMzMgNDdMMzMgNDhMMzIgNDhMMzIgNDlMMzQgNDlMMzQgNDdMMzUgNDdMMzUgNDZMMzcgNDZMMzcgNDdMMzggNDdMMzggNDZMNDEgNDZMNDEgNDRMMzggNDRMMzggNDZMMzcgNDZMMzcgNDNMMzYgNDNMMzYgNDFMMzggNDFMMzggNDJMMzkgNDJMMzkgNDNMNDEgNDNMNDEgNDJMNDIgNDJMNDIgNDVMNDMgNDVMNDMgNDNMNDUgNDNMNDUgNDJMNDcgNDJMNDcgNDNMNDggNDNMNDggNDRMNDcgNDRMNDcgNDVMNDYgNDVMNDYgNDZMNDcgNDZMNDcgNDVMNDkgNDVMNDkgNDRMNTAgNDRMNTAgNDNMNTMgNDNMNTMgNDVMNTAgNDVMNTAgNDdMNDggNDdMNDggNDhMNDcgNDhMNDcgNDlMNDYgNDlMNDYgNTBMNDggNTBMNDggNDhMNTAgNDhMNTAgNDdMNTEgNDdMNTEgNDhMNTIgNDhMNTIgNDdMNTEgNDdMNTEgNDZMNTMgNDZMNTMgNDdMNTQgNDdMNTQgNDZMNTMgNDZMNTMgNDVMNTUgNDVMNTUgNDZMNTYgNDZMNTYgNDVMNTUgNDVMNTUgNDRMNTQgNDRMNTQgNDNMNTMgNDNMNTMgNDFMNTUgNDFMNTUgNDJMNTYgNDJMNTYgNDFMNTUgNDFMNTUgNDBMNTMgNDBMNTMgNDFMNTAgNDFMNTAgNDBMNDkgNDBMNDkgNDFMNTAgNDFMNTAgNDNMNDkgNDNMNDkgNDJMNDcgNDJMNDcgNDFMNDggNDFMNDggNDBMNDcgNDBMNDcgMzdMNDggMzdMNDggMzZMNDcgMzZMNDcgMzVMNDggMzVMNDggMzRMNDkgMzRMNDkgMzhMNDggMzhMNDggMzlMNTEgMzlMNTEgNDBMNTIgNDBMNTIgMzlMNTMgMzlMNTMgMzdMNTEgMzdMNTEgMzZMNTAgMzZMNTAgMzVMNTEgMzVMNTEgMzJMNTMgMzJMNTMgMzFMNTEgMzFMNTEgMzJMNTAgMzJMNTAgMzFMNDkgMzFMNDkgMzJMNTAgMzJMNTAgMzNMNDggMzNMNDggMzJMNDcgMzJMNDcgMzNMNDYgMzNMNDYgMzBMNDcgMzBMNDcgMzFMNDggMzFMNDggMjlMNDcgMjlMNDcgMjhMNDggMjhMNDggMjdMNDYgMjdMNDYgMjZMNDQgMjZMNDQgMjVMNDUgMjVMNDUgMjRMNDIgMjRMNDIgMjNMNDMgMjNMNDMgMjJMNDIgMjJMNDIgMjNMNDEgMjNMNDEgMjJMNDAgMjJMNDAgMjFMNDEgMjFMNDEgMjBMNDAgMjBMNDAgMTlMNDIgMTlMNDIgMThMNDAgMThMNDAgMTdMNDIgMTdMNDIgMTVMNDQgMTVMNDQgMTdMNDMgMTdMNDMgMjBMNDQgMjBMNDQgMjNMNDUgMjNMNDUgMjBMNDYgMjBMNDYgMThMNDUgMThMNDUgMTVMNDYgMTVMNDYgMTRMNDcgMTRMNDcgMTNMNTAgMTNMNTAgMTRMNTEgMTRMNTEgMTNMNTMgMTNMNTMgMTRMNTIgMTRMNTIgMTVMNTUgMTVMNTUgMTRMNTYgMTRMNTYgMTNMNTUgMTNMNTUgMTJMNTYgMTJMNTYgMTFMNTUgMTFMNTUgMTJMNTQgMTJMNTQgMTFMNTMgMTFMNTMgMTJMNTEgMTJMNTEgMTNMNTAgMTNMNTAgMTJMNDcgMTJMNDcgMTFMNDggMTFMNDggMTBMNDcgMTBMNDcgOUw0NSA5TDQ1IDhMNDMgOEw0MyAxMEw0MiAxMEw0MiA4TDQwIDhMNDAgNkwzOSA2TDM5IDdMMzggN0wzOCA1TDQxIDVMNDEgM0w0MCAzTDQwIDRMMzkgNEwzOSAzTDM3IDNMMzcgMkwzNiAyTDM2IDFMMzMgMUwzMyAyTDMyIDJMMzIgNEwzMSA0TDMxIDdMMzIgN0wzMiA4TDMxIDhMMzEgOUwzMCA5TDMwIDEwTDI5IDEwTDI5IDExTDI4IDExTDI4IDEyTDI5IDEyTDI5IDExTDMwIDExTDMwIDEzTDI5IDEzTDI5IDE0TDMwIDE0TDMwIDE1TDI4IDE1TDI4IDE0TDI2IDE0TDI2IDE1TDI0IDE1TDI0IDE2TDIzIDE2TDIzIDE0TDI0IDE0TDI0IDEzTDIzIDEzTDIzIDEyTDI1IDEyTDI1IDEzTDI2IDEzTDI2IDEyTDI3IDEyTDI3IDEwTDI2IDEwTDI2IDZMMjUgNkwyNSA1TDI0IDVMMjQgNkwyMyA2TDIzIDVMMjIgNUwyMiA0TDIxIDRMMjEgNUwyMCA1TDIwIDRMMTkgNEwxOSAyTDIwIDJMMjAgMUwxOSAxTDE5IDJMMTggMkwxOCAxTDE3IDFMMTcgM0wxNiAzTDE2IDJMMTUgMkwxNSAxWk0zOSAxTDM5IDJMNDAgMkw0MCAxWk00NiAxTDQ2IDJMNDcgMkw0NyAxWk0yNSAyTDI1IDNMMjYgM0wyNiAyWk0zNCAyTDM0IDNMMzYgM0wzNiAyWk0xNyAzTDE3IDRMMTUgNEwxNSA2TDE0IDZMMTQgN0wxNSA3TDE1IDhMMTYgOEwxNiA3TDE3IDdMMTcgOEwxOCA4TDE4IDlMMjEgOUwyMSA2TDIyIDZMMjIgN0wyMyA3TDIzIDZMMjIgNkwyMiA1TDIxIDVMMjEgNkwyMCA2TDIwIDhMMTggOEwxOCA3TDE5IDdMMTkgNEwxOCA0TDE4IDNaTTE3IDRMMTcgNUwxNiA1TDE2IDZMMTUgNkwxNSA3TDE2IDdMMTYgNkwxNyA2TDE3IDdMMTggN0wxOCA0Wk0zMyA0TDMzIDVMMzIgNUwzMiA3TDMzIDdMMzMgNUwzNSA1TDM1IDZMMzQgNkwzNCA3TDM1IDdMMzUgNkwzNiA2TDM2IDdMMzcgN0wzNyA4TDM4IDhMMzggN0wzNyA3TDM3IDVMMzYgNUwzNiA0Wk05IDVMOSA4TDEwIDhMMTAgNVpNMjcgNUwyNyA4TDMwIDhMMzAgNVpNNDIgNUw0MiA2TDQxIDZMNDEgN0w0MiA3TDQyIDZMNDMgNkw0MyA3TDQ0IDdMNDQgNkw0MyA2TDQzIDVaTTI0IDZMMjQgOEwyMyA4TDIzIDlMMjIgOUwyMiAxMEwyMSAxMEwyMSAxMUwxOCAxMUwxOCAxMkwxNyAxMkwxNyAxM0wxNiAxM0wxNiAxMkwxNSAxMkwxNSAxMUwxNyAxMUwxNyAxMEwxNCAxMEwxNCAxM0wxMiAxM0wxMiAxNEwxNCAxNEwxNCAxM0wxNiAxM0wxNiAxNEwxNSAxNEwxNSAxNUwxNiAxNUwxNiAxNEwxNyAxNEwxNyAxNUwxOCAxNUwxOCAxMkwyMSAxMkwyMSAxNEwyMCAxNEwyMCAxNUwyMiAxNUwyMiAxNEwyMyAxNEwyMyAxM0wyMiAxM0wyMiAxMkwyMyAxMkwyMyAxMUwyNCAxMUwyNCAxMEwyNSAxMEwyNSAxMkwyNiAxMkwyNiAxMEwyNSAxMEwyNSA2Wk0yOCA2TDI4IDdMMjkgN0wyOSA2Wk00NSA2TDQ1IDdMNDYgN0w0NiA2Wk00OCA2TDQ4IDdMNDkgN0w0OSA2Wk02IDhMNiA5TDcgOUw3IDhaTTMyIDhMMzIgOUwzMSA5TDMxIDEwTDMwIDEwTDMwIDExTDMxIDExTDMxIDEzTDMyIDEzTDMyIDE0TDMxIDE0TDMxIDE2TDI3IDE2TDI3IDE1TDI2IDE1TDI2IDE2TDI0IDE2TDI0IDE3TDIyIDE3TDIyIDE4TDI0IDE4TDI0IDE3TDI1IDE3TDI1IDE4TDI3IDE4TDI3IDE3TDMwIDE3TDMwIDE4TDI4IDE4TDI4IDE5TDI3IDE5TDI3IDIwTDI2IDIwTDI2IDE5TDI0IDE5TDI0IDIwTDIzIDIwTDIzIDE5TDIxIDE5TDIxIDE4TDIwIDE4TDIwIDE5TDIxIDE5TDIxIDIyTDE5IDIyTDE5IDI0TDIyIDI0TDIyIDI1TDI0IDI1TDI0IDIzTDI1IDIzTDI1IDI0TDI3IDI0TDI3IDIzTDI5IDIzTDI5IDI0TDMyIDI0TDMyIDI1TDMzIDI1TDMzIDI2TDM1IDI2TDM1IDI1TDM0IDI1TDM0IDI0TDMzIDI0TDMzIDIyTDMyIDIyTDMyIDIxTDMzIDIxTDMzIDIwTDM1IDIwTDM1IDE4TDM0IDE4TDM0IDE3TDM1IDE3TDM1IDE2TDM2IDE2TDM2IDE5TDM3IDE5TDM3IDIwTDM2IDIwTDM2IDIyTDM1IDIyTDM1IDIxTDM0IDIxTDM0IDIzTDM2IDIzTDM2IDI0TDM4IDI0TDM4IDIxTDM3IDIxTDM3IDIwTDM5IDIwTDM5IDE5TDQwIDE5TDQwIDE4TDM4IDE4TDM4IDE3TDM3IDE3TDM3IDE2TDM2IDE2TDM2IDE1TDM3IDE1TDM3IDE0TDM4IDE0TDM4IDE1TDM5IDE1TDM5IDE3TDQwIDE3TDQwIDE2TDQxIDE2TDQxIDE1TDQwIDE1TDQwIDE0TDM4IDE0TDM4IDEzTDM5IDEzTDM5IDEyTDQxIDEyTDQxIDE0TDQ2IDE0TDQ2IDEzTDQ3IDEzTDQ3IDEyTDQ2IDEyTDQ2IDExTDQ3IDExTDQ3IDEwTDQ1IDEwTDQ1IDExTDQ0IDExTDQ0IDEwTDQzIDEwTDQzIDExTDQyIDExTDQyIDEwTDQxIDEwTDQxIDlMNDAgOUw0MCA4TDM5IDhMMzkgMTBMMzggMTBMMzggMTFMMzkgMTFMMzkgMTJMMzcgMTJMMzcgMTFMMzUgMTFMMzUgMTBMMzcgMTBMMzcgOUwzNiA5TDM2IDhMMzUgOEwzNSAxMEwzNCAxMEwzNCA5TDMzIDlMMzMgOFpNMiAxMEwyIDEyTDMgMTJMMyAxM0wyIDEzTDIgMTRMNCAxNEw0IDEyTDMgMTJMMyAxMFpNNiAxMEw2IDExTDcgMTFMNyAxMFpNMzEgMTBMMzEgMTFMMzIgMTFMMzIgMTBaTTQwIDEwTDQwIDExTDQxIDExTDQxIDEwWk00OSAxMEw0OSAxMUw1MCAxMUw1MCAxMFpNMjEgMTFMMjEgMTJMMjIgMTJMMjIgMTFaTTM0IDExTDM0IDEyTDM1IDEyTDM1IDExWk0zNiAxMkwzNiAxM0wzNSAxM0wzNSAxNEwzNCAxNEwzNCAxNUwzMyAxNUwzMyAxNEwzMiAxNEwzMiAxNkwzMSAxNkwzMSAxOEwzMyAxOEwzMyAxN0wzNCAxN0wzNCAxNUwzNiAxNUwzNiAxM0wzNyAxM0wzNyAxMlpNNDIgMTJMNDIgMTNMNDMgMTNMNDMgMTJaTTQ0IDEyTDQ0IDEzTDQ1IDEzTDQ1IDEyWk01MyAxMkw1MyAxM0w1NCAxM0w1NCAxNEw1NSAxNEw1NSAxM0w1NCAxM0w1NCAxMlpNNiAxNEw2IDE1TDkgMTVMOSAxNkwxMCAxNkwxMCAxNFpNMyAxNkwzIDE3TDQgMTdMNCAxNlpNNiAxNkw2IDE3TDcgMTdMNyAxNlpNMTQgMTZMMTQgMTdMMTUgMTdMMTUgMThMMTQgMThMMTQgMTlMMTMgMTlMMTMgMjBMMTIgMjBMMTIgMjJMMTMgMjJMMTMgMjNMMTQgMjNMMTQgMjRMMTMgMjRMMTMgMjVMMTQgMjVMMTQgMjZMMTUgMjZMMTUgMjVMMTcgMjVMMTcgMjZMMTYgMjZMMTYgMjdMMTkgMjdMMTkgMjZMMjAgMjZMMjAgMjVMMTkgMjVMMTkgMjZMMTggMjZMMTggMjNMMTcgMjNMMTcgMjJMMTggMjJMMTggMjFMMjAgMjFMMjAgMjBMMTggMjBMMTggMTlMMTcgMTlMMTcgMThMMTYgMThMMTYgMTdMMTUgMTdMMTUgMTZaTTIwIDE2TDIwIDE3TDIxIDE3TDIxIDE2Wk0zMiAxNkwzMiAxN0wzMyAxN0wzMyAxNlpNNTIgMTZMNTIgMThMNTEgMThMNTEgMTdMNTAgMTdMNTAgMThMNTEgMThMNTEgMTlMNTIgMTlMNTIgMThMNTMgMThMNTMgMTlMNTUgMTlMNTUgMThMNTQgMThMNTQgMTZaTTggMTdMOCAxOEw5IDE4TDkgMTdaTTE1IDE4TDE1IDE5TDE0IDE5TDE0IDIwTDE1IDIwTDE1IDE5TDE2IDE5TDE2IDE4Wk0zNyAxOEwzNyAxOUwzOCAxOUwzOCAxOFpNMjggMTlMMjggMjBMMjkgMjBMMjkgMjFMMjYgMjFMMjYgMjBMMjQgMjBMMjQgMjFMMjMgMjFMMjMgMjJMMjIgMjJMMjIgMjRMMjMgMjRMMjMgMjNMMjQgMjNMMjQgMjFMMjUgMjFMMjUgMjNMMjYgMjNMMjYgMjJMMzAgMjJMMzAgMjNMMzIgMjNMMzIgMjJMMzEgMjJMMzEgMjFMMzIgMjFMMzIgMjBMMzEgMjBMMzEgMjFMMzAgMjFMMzAgMjBMMjkgMjBMMjkgMTlaTTQ0IDE5TDQ0IDIwTDQ1IDIwTDQ1IDE5Wk05IDIwTDkgMjFMMTAgMjFMMTAgMjBaTTE2IDIwTDE2IDIxTDE3IDIxTDE3IDIwWk0xMyAyMUwxMyAyMkwxNCAyMkwxNCAyM0wxNSAyM0wxNSAyNEwxNCAyNEwxNCAyNUwxNSAyNUwxNSAyNEwxNiAyNEwxNiAyMkwxNSAyMkwxNSAyMVpNNDggMjFMNDggMjJMNDkgMjJMNDkgMjFaTTM2IDIyTDM2IDIzTDM3IDIzTDM3IDIyWk0zOSAyMkwzOSAyM0w0MCAyM0w0MCAyNEwzOSAyNEwzOSAyNkwzNiAyNkwzNiAyN0wzNCAyN0wzNCAyOEwzNSAyOEwzNSAzMUwzNCAzMUwzNCAzMkwzNSAzMkwzNSAzMUwzOSAzMUwzOSAzMkwzOCAzMkwzOCAzM0wzNyAzM0wzNyAzMkwzNiAzMkwzNiAzNEwzNSAzNEwzNSAzM0wzMiAzM0wzMiAzNEwzMSAzNEwzMSAzM0wyOSAzM0wyOSAzNEwzMCAzNEwzMCAzNUwzNSAzNUwzNSAzNkwzNiAzNkwzNiAzN0wzNCAzN0wzNCAzNkwzMiAzNkwzMiAzOUwzMyAzOUwzMyA0MEwzMCA0MEwzMCA0MkwzMSA0MkwzMSA0M0wzMiA0M0wzMiA0NEwzMSA0NEwzMSA0NkwzNSA0NkwzNSA0NUwzNiA0NUwzNiA0M0wzNSA0M0wzNSAzOEwzOCAzOEwzOCAzOUw0MCAzOUw0MCA0MEwzOCA0MEwzOCA0MUw0MCA0MUw0MCA0MEw0MiA0MEw0MiA0Mkw0NCA0Mkw0NCA0MEw0NSA0MEw0NSA0MUw0NiA0MUw0NiA0MEw0NSA0MEw0NSAzOUw0NiAzOUw0NiAzOEw0NSAzOEw0NSAzOUw0NCAzOUw0NCA0MEw0MyA0MEw0MyAzOUw0MCAzOUw0MCAzOEw0NCAzOEw0NCAzN0wzOSAzN0wzOSAzNkwzOCAzNkwzOCAzN0wzNyAzN0wzNyAzNkwzNiAzNkwzNiAzNUwzNyAzNUwzNyAzNEwzOCAzNEwzOCAzNUw0MCAzNUw0MCAzNkw0MSAzNkw0MSAzNUw0MiAzNUw0MiAzNkw0MyAzNkw0MyAzM0w0NCAzM0w0NCAzNEw0NSAzNEw0NSAzM0w0NCAzM0w0NCAzMkw0MyAzMkw0MyAzMUw0MiAzMUw0MiAzMkw0MSAzMkw0MSAzMUw0MCAzMUw0MCAzMEw0NSAzMEw0NSAyOUw0NCAyOUw0NCAyOEw0NiAyOEw0NiAyN0w0NCAyN0w0NCAyOEw0MyAyOEw0MyAyN0w0MiAyN0w0MiAyNkw0MyAyNkw0MyAyNUw0MiAyNUw0MiAyNkw0MSAyNkw0MSAyN0wzOSAyN0wzOSAyNkw0MCAyNkw0MCAyNEw0MSAyNEw0MSAyM0w0MCAyM0w0MCAyMlpNNTMgMjJMNTMgMjNMNTQgMjNMNTQgMjJaTTMgMjNMMyAyNEw0IDI0TDQgMjNaTTYgMjRMNiAyNUw3IDI1TDcgMjRaTTI1IDI1TDI1IDI2TDI0IDI2TDI0IDI3TDI1IDI3TDI1IDI2TDI2IDI2TDI2IDI1Wk0zIDI2TDMgMjdMMiAyN0wyIDI5TDEgMjlMMSAzMUwyIDMxTDIgMjlMMyAyOUwzIDI4TDQgMjhMNCAyNlpNMjIgMjZMMjIgMjdMMjMgMjdMMjMgMjZaTTU0IDI2TDU0IDI3TDU1IDI3TDU1IDI2Wk01IDI3TDUgMzBMOCAzMEw4IDI3Wk0yNyAyN0wyNyAzMEwzMCAzMEwzMCAyN1pNMzYgMjdMMzYgMjhMMzcgMjhMMzcgMjlMMzYgMjlMMzYgMzBMMzkgMzBMMzkgMjlMMzggMjlMMzggMjhMMzkgMjhMMzkgMjdaTTQxIDI3TDQxIDI4TDQwIDI4TDQwIDI5TDQzIDI5TDQzIDI4TDQyIDI4TDQyIDI3Wk00OSAyN0w0OSAzMEw1MiAzMEw1MiAyN1pNNiAyOEw2IDI5TDcgMjlMNyAyOFpNMjggMjhMMjggMjlMMjkgMjlMMjkgMjhaTTMyIDI4TDMyIDI5TDMzIDI5TDMzIDI4Wk01MCAyOEw1MCAyOUw1MSAyOUw1MSAyOFpNNTQgMjhMNTQgMzFMNTUgMzFMNTUgMjhaTTI1IDI5TDI1IDMwTDI2IDMwTDI2IDI5Wk0zIDMxTDMgMzNMNCAzM0w0IDM2TDUgMzZMNSAzM0w2IDMzTDYgMzRMOSAzNEw5IDM1TDggMzVMOCAzOEw3IDM4TDcgMzdMNSAzN0w1IDM4TDcgMzhMNyAzOUw0IDM5TDQgNDBMNSA0MEw1IDQxTDYgNDFMNiA0Mkw3IDQyTDcgNDNMNSA0M0w1IDQ0TDMgNDRMMyA0NUw1IDQ1TDUgNDRMNyA0NEw3IDQzTDggNDNMOCA0Mkw5IDQyTDkgNDFMMTAgNDFMMTAgNDBMOCA0MEw4IDQyTDcgNDJMNyA0MUw2IDQxTDYgNDBMNyA0MEw3IDM5TDggMzlMOCAzOEw5IDM4TDkgMzlMMTAgMzlMMTAgMzhMMTEgMzhMMTEgMzZMMTAgMzZMMTAgMzVMMTEgMzVMMTEgMzRMMTAgMzRMMTAgMzNMNiAzM0w2IDMyTDcgMzJMNyAzMUw1IDMxTDUgMzJMNCAzMkw0IDMxWk0xNiAzMkwxNiAzM0wxNyAzM0wxNyAzMlpNNDAgMzJMNDAgMzNMNDEgMzNMNDEgMzJaTTQyIDMyTDQyIDMzTDQzIDMzTDQzIDMyWk0zOCAzM0wzOCAzNEwzOSAzNEwzOSAzM1pNNTIgMzNMNTIgMzRMNTMgMzRMNTMgMzNaTTU2IDMzTDU2IDM0TDU3IDM0TDU3IDMzWk00MCAzNEw0MCAzNUw0MSAzNUw0MSAzNFpNNDYgMzRMNDYgMzVMNDQgMzVMNDQgMzZMNDUgMzZMNDUgMzdMNDcgMzdMNDcgMzZMNDYgMzZMNDYgMzVMNDcgMzVMNDcgMzRaTTYgMzVMNiAzNkw3IDM2TDcgMzVaTTIxIDM1TDIxIDM2TDE4IDM2TDE4IDM3TDIxIDM3TDIxIDM2TDIyIDM2TDIyIDM4TDIzIDM4TDIzIDM3TDI0IDM3TDI0IDM2TDI1IDM2TDI1IDM1TDI0IDM1TDI0IDM2TDIyIDM2TDIyIDM1Wk01MiAzNUw1MiAzNkw1MyAzNkw1MyAzNVpNOSAzNkw5IDM4TDEwIDM4TDEwIDM2Wk0xMiAzNkwxMiAzN0wxMyAzN0wxMyAzNlpNMTYgMzZMMTYgMzdMMTcgMzdMMTcgMzZaTTMzIDM3TDMzIDM4TDM0IDM4TDM0IDM3Wk0zOCAzN0wzOCAzOEwzOSAzOEwzOSAzN1pNNTAgMzdMNTAgMzhMNTEgMzhMNTEgMzdaTTE5IDM4TDE5IDQwTDIwIDQwTDIwIDM4Wk0yMSA0MEwyMSA0MUwyMiA0MUwyMiA0MFpNMTkgNDFMMTkgNDJMMTggNDJMMTggNDNMMTkgNDNMMTkgNDRMMTcgNDRMMTcgNDVMMTkgNDVMMTkgNDRMMjAgNDRMMjAgNDNMMjEgNDNMMjEgNDJMMjAgNDJMMjAgNDFaTTIzIDQxTDIzIDQyTDIyIDQyTDIyIDQ1TDIzIDQ1TDIzIDQ3TDI0IDQ3TDI0IDQ0TDIzIDQ0TDIzIDQzTDI1IDQzTDI1IDQyTDI3IDQyTDI3IDQxWk0zMyA0MUwzMyA0MkwzMiA0MkwzMiA0M0wzMyA0M0wzMyA0MkwzNCA0MkwzNCA0MVpNMCA0M0wwIDQ0TDEgNDRMMSA0M1pNMzQgNDNMMzQgNDVMMzUgNDVMMzUgNDNaTTMgNDZMMyA0N0w1IDQ3TDUgNDZaTTE4IDQ3TDE4IDQ4TDE5IDQ4TDE5IDQ3Wk01MyA0OEw1MyA1MEw1NCA1MEw1NCA0OUw1NSA0OUw1NSA0OFpNMjAgNDlMMjAgNTBMMjEgNTBMMjEgNDlaTTI1IDQ5TDI1IDUwTDI2IDUwTDI2IDQ5Wk0yNyA0OUwyNyA1MkwzMCA1MkwzMCA0OVpNNDkgNDlMNDkgNTJMNTIgNTJMNTIgNDlaTTI4IDUwTDI4IDUxTDI5IDUxTDI5IDUwWk0zMSA1MEwzMSA1M0wzNCA1M0wzNCA1MUwzNSA1MUwzNSA1MkwzNiA1MkwzNiA1MUwzNSA1MUwzNSA1MEwzNCA1MEwzNCA1MUwzMiA1MUwzMiA1MFpNNTAgNTBMNTAgNTFMNTEgNTFMNTEgNTBaTTI1IDUxTDI1IDUyTDI0IDUyTDI0IDUzTDIxIDUzTDIxIDU0TDIyIDU0TDIyIDU1TDIzIDU1TDIzIDU2TDI1IDU2TDI1IDU1TDI2IDU1TDI2IDU0TDI4IDU0TDI4IDU1TDI5IDU1TDI5IDU0TDMwIDU0TDMwIDUzTDI2IDUzTDI2IDUxWk00NiA1MUw0NiA1Mkw0NyA1Mkw0NyA1M0w0NSA1M0w0NSA1Mkw0NCA1Mkw0NCA1M0w0MyA1M0w0MyA1Mkw0MiA1Mkw0MiA1M0w0MyA1M0w0MyA1NEw0NCA1NEw0NCA1NUw0NiA1NUw0NiA1NEw0NyA1NEw0NyA1M0w0OCA1M0w0OCA1NEw0OSA1NEw0OSA1M0w0OCA1M0w0OCA1MVpNNTMgNTJMNTMgNTNMNTUgNTNMNTUgNTJaTTE2IDUzTDE2IDU0TDE1IDU0TDE1IDU1TDEzIDU1TDEzIDU2TDE0IDU2TDE0IDU3TDE1IDU3TDE1IDU1TDE2IDU1TDE2IDU2TDE3IDU2TDE3IDU1TDE2IDU1TDE2IDU0TDE3IDU0TDE3IDUzWk0xOSA1M0wxOSA1NEwyMCA1NEwyMCA1M1pNMjQgNTNMMjQgNTRMMjYgNTRMMjYgNTNaTTM1IDUzTDM1IDU0TDM2IDU0TDM2IDU1TDM3IDU1TDM3IDU2TDQwIDU2TDQwIDU1TDM3IDU1TDM3IDU0TDM2IDU0TDM2IDUzWk01MCA1M0w1MCA1NEw1MSA1NEw1MSA1M1pNMzEgNTRMMzEgNTVMMzIgNTVMMzIgNTRaTTUyIDU0TDUyIDU1TDUzIDU1TDUzIDU0Wk0wIDBMMCA3TDcgN0w3IDBaTTEgMUwxIDZMNiA2TDYgMVpNMiAyTDIgNUw1IDVMNSAyWk01MCAwTDUwIDdMNTcgN0w1NyAwWk01MSAxTDUxIDZMNTYgNkw1NiAxWk01MiAyTDUyIDVMNTUgNUw1NSAyWk0wIDUwTDAgNTdMNyA1N0w3IDUwWk0xIDUxTDEgNTZMNiA1Nkw2IDUxWk0yIDUyTDIgNTVMNSA1NUw1IDUyWiIgZmlsbD0iIzAwMDAwMCIvPjwvZz48L2c+PC9zdmc+Cg==	data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyIgPz4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+DQo8c3ZnIHdpZHRoPSIyMzciIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCAyMzcgODAiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCgk8ZGVzYz4wMDAwMDAwMTwvZGVzYz4NCgk8ZyBpZD0iYmFycyIgZmlsbD0icmdiKDAsMCwwKSIgc3Ryb2tlPSJub25lIj4NCgkJPHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjYiIGhlaWdodD0iODAiIC8+DQoJCTxyZWN0IHg9IjkiIHk9IjAiIHdpZHRoPSIzIiBoZWlnaHQ9IjgwIiAvPg0KCQk8cmVjdCB4PSIxOCIgeT0iMCIgd2lkdGg9IjkiIGhlaWdodD0iODAiIC8+DQoJCTxyZWN0IHg9IjMzIiB5PSIwIiB3aWR0aD0iNiIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iNDIiIHk9IjAiIHdpZHRoPSI2IiBoZWlnaHQ9IjgwIiAvPg0KCQk8cmVjdCB4PSI1NCIgeT0iMCIgd2lkdGg9IjYiIGhlaWdodD0iODAiIC8+DQoJCTxyZWN0IHg9IjY2IiB5PSIwIiB3aWR0aD0iNiIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iNzUiIHk9IjAiIHdpZHRoPSI2IiBoZWlnaHQ9IjgwIiAvPg0KCQk8cmVjdCB4PSI4NyIgeT0iMCIgd2lkdGg9IjYiIGhlaWdodD0iODAiIC8+DQoJCTxyZWN0IHg9Ijk5IiB5PSIwIiB3aWR0aD0iNiIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMTA4IiB5PSIwIiB3aWR0aD0iNiIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMTIwIiB5PSIwIiB3aWR0aD0iNiIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMTMyIiB5PSIwIiB3aWR0aD0iNiIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMTQ0IiB5PSIwIiB3aWR0aD0iNiIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMTUzIiB5PSIwIiB3aWR0aD0iNiIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMTY1IiB5PSIwIiB3aWR0aD0iMyIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMTc0IiB5PSIwIiB3aWR0aD0iNiIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMTg2IiB5PSIwIiB3aWR0aD0iMyIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMTk4IiB5PSIwIiB3aWR0aD0iNiIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMjEzIiB5PSIwIiB3aWR0aD0iOSIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMjI1IiB5PSIwIiB3aWR0aD0iMyIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMjMxIiB5PSIwIiB3aWR0aD0iNiIgaGVpZ2h0PSI4MCIgLz4NCgk8L2c+DQo8L3N2Zz4NCg==
5	MSI 24'' Monitor	1	MSI	32d4323232	1	21231231221	2005-10-11	5800	2025-12-17	5	1	2	\N	2	2025-12-16 02:00:07	2025-12-29 08:09:26	data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZlcnNpb249IjEuMSIgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIHZpZXdCb3g9IjAgMCAzMDAgMzAwIj48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2ZmZmZmZiIvPjxnIHRyYW5zZm9ybT0ic2NhbGUoNC45MTgpIj48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgwLDApIj48cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik04IDBMOCAxTDkgMUw5IDBaTTEwIDBMMTAgMUwxMSAxTDExIDJMOCAyTDggM0wxMCAzTDEwIDRMOCA0TDggNUwxMCA1TDEwIDdMMTEgN0wxMSA4TDEwIDhMMTAgOUwxMSA5TDExIDEwTDEwIDEwTDEwIDExTDExIDExTDExIDEwTDEyIDEwTDEyIDExTDEzIDExTDEzIDE0TDExIDE0TDExIDEzTDEyIDEzTDEyIDEyTDkgMTJMOSAxM0w4IDEzTDggMTRMOSAxNEw5IDE1TDEwIDE1TDEwIDE0TDExIDE0TDExIDE2TDEyIDE2TDEyIDE1TDE0IDE1TDE0IDE3TDE1IDE3TDE1IDIwTDE0IDIwTDE0IDIxTDE1IDIxTDE1IDIwTDE2IDIwTDE2IDE5TDE3IDE5TDE3IDE4TDE5IDE4TDE5IDIwTDE4IDIwTDE4IDIxTDE3IDIxTDE3IDIzTDE2IDIzTDE2IDI0TDE3IDI0TDE3IDI1TDE2IDI1TDE2IDI2TDE3IDI2TDE3IDI4TDE2IDI4TDE2IDI3TDE1IDI3TDE1IDIzTDE0IDIzTDE0IDIyTDEzIDIyTDEzIDIwTDExIDIwTDExIDIxTDkgMjFMOSAyM0w3IDIzTDcgMjJMNiAyMkw2IDIxTDcgMjFMNyAyMEw1IDIwTDUgMThMNiAxOEw2IDE5TDggMTlMOCAyMEw5IDIwTDkgMTlMMTMgMTlMMTMgMTdMMTIgMTdMMTIgMThMNiAxOEw2IDE3TDcgMTdMNyAxNkw4IDE2TDggMTdMMTAgMTdMMTAgMTZMOCAxNkw4IDE1TDcgMTVMNyAxNEw2IDE0TDYgMTNMNyAxM0w3IDEyTDggMTJMOCAxMUw3IDExTDcgMTBMNiAxMEw2IDlMNyA5TDcgOEw1IDhMNSAxMEw0IDEwTDQgMTFMMyAxMUwzIDEwTDIgMTBMMiA5TDAgOUwwIDEwTDEgMTBMMSAxMUwwIDExTDAgMTRMMiAxNEwyIDE1TDQgMTVMNCAxNEwzIDE0TDMgMTJMNSAxMkw1IDEwTDYgMTBMNiAxMUw3IDExTDcgMTJMNiAxMkw2IDEzTDUgMTNMNSAxOEwzIDE4TDMgMTdMNCAxN0w0IDE2TDMgMTZMMyAxN0wxIDE3TDEgMTZMMCAxNkwwIDE3TDEgMTdMMSAxOUwwIDE5TDAgMjBMMSAyMEwxIDE5TDMgMTlMMyAyMEw0IDIwTDQgMjJMMyAyMkwzIDIxTDEgMjFMMSAyNUwwIDI1TDAgMjhMMSAyOEwxIDI3TDIgMjdMMiAyNkwzIDI2TDMgMjVMNCAyNUw0IDI0TDUgMjRMNSAyMkw2IDIyTDYgMjNMNyAyM0w3IDI0TDYgMjRMNiAyNUw3IDI1TDcgMjZMNiAyNkw2IDI3TDUgMjdMNSAyNkw0IDI2TDQgMjdMMyAyN0wzIDI4TDQgMjhMNCAzMEwyIDMwTDIgMjlMMSAyOUwxIDMwTDIgMzBMMiAzMUw0IDMxTDQgMzNMNSAzM0w1IDM0TDQgMzRMNCAzNUw1IDM1TDUgMzZMNiAzNkw2IDM3TDggMzdMOCA0MEw1IDQwTDUgNDFMMyA0MUwzIDQwTDQgNDBMNCAzOUwzIDM5TDMgMzhMNSAzOEw1IDM3TDQgMzdMNCAzNkwxIDM2TDEgMzVMMCAzNUwwIDM2TDEgMzZMMSAzN0wzIDM3TDMgMzhMMiAzOEwyIDQyTDMgNDJMMyA0NEwxIDQ0TDEgNDNMMCA0M0wwIDQ0TDEgNDRMMSA0NUwwIDQ1TDAgNDdMMSA0N0wxIDQ1TDIgNDVMMiA0N0wzIDQ3TDMgNDRMNCA0NEw0IDQ1TDUgNDVMNSA0Nkw0IDQ2TDQgNDdMNSA0N0w1IDQ2TDYgNDZMNiA0N0w3IDQ3TDcgNDhMNiA0OEw2IDQ5TDUgNDlMNSA0OEwyIDQ4TDIgNDlMMSA0OUwxIDQ4TDAgNDhMMCA0OUwxIDQ5TDEgNTBMMiA1MEwyIDUxTDAgNTFMMCA1M0w0IDUzTDQgNTJMNSA1Mkw1IDUxTDggNTFMOCA1Mkw2IDUyTDYgNTNMOCA1M0w4IDU0TDkgNTRMOSA1NUw4IDU1TDggNTZMMTAgNTZMMTAgNTdMOSA1N0w5IDYwTDEwIDYwTDEwIDYxTDEyIDYxTDEyIDYwTDEwIDYwTDEwIDU5TDEyIDU5TDEyIDU4TDEzIDU4TDEzIDU5TDE0IDU5TDE0IDYxTDE1IDYxTDE1IDYwTDE2IDYwTDE2IDU5TDE0IDU5TDE0IDU4TDEzIDU4TDEzIDU2TDE0IDU2TDE0IDU3TDE1IDU3TDE1IDU4TDE2IDU4TDE2IDU3TDE3IDU3TDE3IDYxTDE5IDYxTDE5IDYwTDIxIDYwTDIxIDYxTDIzIDYxTDIzIDYwTDI0IDYwTDI0IDYxTDI1IDYxTDI1IDYwTDI3IDYwTDI3IDYxTDI4IDYxTDI4IDYwTDI3IDYwTDI3IDU5TDMwIDU5TDMwIDYwTDI5IDYwTDI5IDYxTDMxIDYxTDMxIDYwTDMyIDYwTDMyIDU5TDMwIDU5TDMwIDU4TDI3IDU4TDI3IDU5TDI2IDU5TDI2IDU3TDI0IDU3TDI0IDU2TDI4IDU2TDI4IDU3TDMyIDU3TDMyIDU4TDMzIDU4TDMzIDU5TDM0IDU5TDM0IDU3TDM1IDU3TDM1IDU4TDM2IDU4TDM2IDU5TDM3IDU5TDM3IDYwTDM2IDYwTDM2IDYxTDM4IDYxTDM4IDYwTDM5IDYwTDM5IDYxTDQxIDYxTDQxIDU5TDQwIDU5TDQwIDU3TDM5IDU3TDM5IDU2TDM3IDU2TDM3IDU1TDM5IDU1TDM5IDUzTDM4IDUzTDM4IDU0TDM2IDU0TDM2IDUxTDM4IDUxTDM4IDUwTDM1IDUwTDM1IDUxTDM0IDUxTDM0IDQ2TDMwIDQ2TDMwIDQ1TDMxIDQ1TDMxIDQ0TDMyIDQ0TDMyIDQ1TDM2IDQ1TDM2IDQ2TDM1IDQ2TDM1IDQ4TDM4IDQ4TDM4IDQ3TDM2IDQ3TDM2IDQ2TDM5IDQ2TDM5IDQ1TDQwIDQ1TDQwIDQ3TDM5IDQ3TDM5IDQ5TDQwIDQ5TDQwIDUwTDM5IDUwTDM5IDUxTDQwIDUxTDQwIDUwTDQxIDUwTDQxIDUxTDQyIDUxTDQyIDUyTDQxIDUyTDQxIDUzTDQwIDUzTDQwIDU0TDQxIDU0TDQxIDUzTDQyIDUzTDQyIDU2TDQxIDU2TDQxIDU1TDQwIDU1TDQwIDU2TDQxIDU2TDQxIDU4TDQzIDU4TDQzIDU1TDQ0IDU1TDQ0IDU2TDQ2IDU2TDQ2IDU1TDQ3IDU1TDQ3IDU0TDQ2IDU0TDQ2IDUyTDQ4IDUyTDQ4IDU1TDQ5IDU1TDQ5IDUyTDQ4IDUyTDQ4IDUwTDQ1IDUwTDQ1IDUxTDQ0IDUxTDQ0IDUyTDQzIDUyTDQzIDUxTDQyIDUxTDQyIDUwTDQ0IDUwTDQ0IDQ5TDQ1IDQ5TDQ1IDQ4TDQ2IDQ4TDQ2IDQ5TDQ3IDQ5TDQ3IDQ4TDQ2IDQ4TDQ2IDQ3TDQ3IDQ3TDQ3IDQ1TDQ2IDQ1TDQ2IDQ2TDQ0IDQ2TDQ0IDQ0TDQ2IDQ0TDQ2IDQzTDQ3IDQzTDQ3IDQ0TDQ4IDQ0TDQ4IDQ1TDQ5IDQ1TDQ5IDQ0TDUxIDQ0TDUxIDQ1TDUwIDQ1TDUwIDQ3TDQ5IDQ3TDQ5IDQ2TDQ4IDQ2TDQ4IDQ4TDUwIDQ4TDUwIDQ5TDQ5IDQ5TDQ5IDUxTDUwIDUxTDUwIDUzTDUxIDUzTDUxIDU1TDUwIDU1TDUwIDU2TDQ4IDU2TDQ4IDU4TDQ3IDU4TDQ3IDU3TDQ1IDU3TDQ1IDU4TDQ2IDU4TDQ2IDYwTDQ1IDYwTDQ1IDU5TDQ0IDU5TDQ0IDYwTDQzIDYwTDQzIDU5TDQyIDU5TDQyIDYxTDQ2IDYxTDQ2IDYwTDQ3IDYwTDQ3IDU5TDQ4IDU5TDQ4IDU4TDQ5IDU4TDQ5IDU3TDUwIDU3TDUwIDU5TDUyIDU5TDUyIDYwTDUxIDYwTDUxIDYxTDUzIDYxTDUzIDU5TDUyIDU5TDUyIDU4TDUxIDU4TDUxIDU3TDUwIDU3TDUwIDU2TDUyIDU2TDUyIDU3TDU0IDU3TDU0IDYwTDU1IDYwTDU1IDU5TDU2IDU5TDU2IDYwTDU3IDYwTDU3IDYxTDU4IDYxTDU4IDU4TDU5IDU4TDU5IDU3TDU4IDU3TDU4IDU1TDU3IDU1TDU3IDUzTDU5IDUzTDU5IDU0TDYwIDU0TDYwIDU1TDU5IDU1TDU5IDU2TDYwIDU2TDYwIDYxTDYxIDYxTDYxIDU0TDYwIDU0TDYwIDUzTDYxIDUzTDYxIDUyTDYwIDUyTDYwIDUzTDU5IDUzTDU5IDUxTDYxIDUxTDYxIDQ5TDYwIDQ5TDYwIDUwTDU4IDUwTDU4IDUxTDU2IDUxTDU2IDUwTDU1IDUwTDU1IDQ4TDU2IDQ4TDU2IDQ2TDU3IDQ2TDU3IDQ4TDU4IDQ4TDU4IDQ3TDYxIDQ3TDYxIDQ2TDU4IDQ2TDU4IDQ0TDU3IDQ0TDU3IDQzTDU1IDQzTDU1IDQyTDU2IDQyTDU2IDQxTDU3IDQxTDU3IDQyTDU4IDQyTDU4IDQzTDU5IDQzTDU5IDQyTDYwIDQyTDYwIDQ0TDU5IDQ0TDU5IDQ1TDYwIDQ1TDYwIDQ0TDYxIDQ0TDYxIDQwTDYwIDQwTDYwIDQxTDU5IDQxTDU5IDM4TDYwIDM4TDYwIDM5TDYxIDM5TDYxIDM4TDYwIDM4TDYwIDM3TDYxIDM3TDYxIDM0TDYwIDM0TDYwIDMzTDU5IDMzTDU5IDMyTDYxIDMyTDYxIDMwTDYwIDMwTDYwIDI5TDU5IDI5TDU5IDI3TDU4IDI3TDU4IDI1TDU2IDI1TDU2IDI2TDU1IDI2TDU1IDI1TDU0IDI1TDU0IDI0TDU1IDI0TDU1IDIzTDU0IDIzTDU0IDI0TDUzIDI0TDUzIDIzTDUyIDIzTDUyIDI0TDUwIDI0TDUwIDIzTDUxIDIzTDUxIDIyTDU2IDIyTDU2IDIzTDU3IDIzTDU3IDIyTDU2IDIyTDU2IDIxTDU0IDIxTDU0IDIwTDU1IDIwTDU1IDE5TDUxIDE5TDUxIDIwTDUwIDIwTDUwIDIzTDQ5IDIzTDQ5IDIyTDQ4IDIyTDQ4IDIzTDQ3IDIzTDQ3IDIxTDQ2IDIxTDQ2IDIyTDQ1IDIyTDQ1IDIzTDQ0IDIzTDQ0IDI1TDQzIDI1TDQzIDI0TDQyIDI0TDQyIDI1TDM5IDI1TDM5IDI2TDQwIDI2TDQwIDI3TDM4IDI3TDM4IDI2TDM3IDI2TDM3IDI1TDM4IDI1TDM4IDI0TDM5IDI0TDM5IDIzTDM4IDIzTDM4IDIyTDQwIDIyTDQwIDI0TDQxIDI0TDQxIDIyTDQzIDIyTDQzIDIxTDQ0IDIxTDQ0IDIwTDQ1IDIwTDQ1IDE3TDQ5IDE3TDQ5IDE2TDUwIDE2TDUwIDE1TDUyIDE1TDUyIDE2TDUxIDE2TDUxIDE4TDUyIDE4TDUyIDE3TDUzIDE3TDUzIDE0TDU2IDE0TDU2IDE1TDU0IDE1TDU0IDE2TDU1IDE2TDU1IDE3TDU0IDE3TDU0IDE4TDU2IDE4TDU2IDIwTDU3IDIwTDU3IDIxTDU4IDIxTDU4IDIzTDU5IDIzTDU5IDIyTDYwIDIyTDYwIDIzTDYxIDIzTDYxIDIyTDYwIDIyTDYwIDIxTDYxIDIxTDYxIDIwTDYwIDIwTDYwIDIxTDU5IDIxTDU5IDIwTDU4IDIwTDU4IDE5TDU3IDE5TDU3IDE4TDYwIDE4TDYwIDE5TDYxIDE5TDYxIDE4TDYwIDE4TDYwIDE3TDYxIDE3TDYxIDE0TDYwIDE0TDYwIDEzTDYxIDEzTDYxIDEyTDYwIDEyTDYwIDExTDYxIDExTDYxIDEwTDYwIDEwTDYwIDlMNjEgOUw2MSA4TDYwIDhMNjAgOUw1OSA5TDU5IDhMNTggOEw1OCA5TDU3IDlMNTcgOEw1NiA4TDU2IDlMNTUgOUw1NSA4TDU0IDhMNTQgOUw1MyA5TDUzIDhMNTEgOEw1MSA5TDUwIDlMNTAgOEw0OCA4TDQ4IDdMNDkgN0w0OSA1TDUwIDVMNTAgN0w1MSA3TDUxIDVMNTIgNUw1MiA0TDUzIDRMNTMgMEw1MSAwTDUxIDJMNTAgMkw1MCAzTDQ5IDNMNDkgMkw0NyAyTDQ3IDFMNDggMUw0OCAwTDQyIDBMNDIgMUw0MyAxTDQzIDJMNDIgMkw0MiAzTDQzIDNMNDMgNEw0MiA0TDQyIDVMNDAgNUw0MCA0TDQxIDRMNDEgM0wzOSAzTDM5IDVMMzggNUwzOCAxMEwzNiAxMEwzNiA5TDM3IDlMMzcgOEwzMyA4TDMzIDZMMzQgNkwzNCA3TDM1IDdMMzUgNkwzNCA2TDM0IDVMMzYgNUwzNiA3TDM3IDdMMzcgM0wzOCAzTDM4IDFMMzcgMUwzNyAwTDM2IDBMMzYgMkwzNSAyTDM1IDNMMzQgM0wzNCA1TDMzIDVMMzMgNEwyOCA0TDI4IDNMMjcgM0wyNyA1TDI2IDVMMjYgMkwyNSAyTDI1IDFMMjQgMUwyNCAyTDIzIDJMMjMgMEwyMiAwTDIyIDJMMjMgMkwyMyA0TDIyIDRMMjIgM0wyMSAzTDIxIDJMMjAgMkwyMCAzTDIxIDNMMjEgNEwyMiA0TDIyIDVMMjMgNUwyMyA2TDIyIDZMMjIgN0wyMSA3TDIxIDVMMjAgNUwyMCA0TDE4IDRMMTggM0wxOSAzTDE5IDFMMjAgMUwyMCAwTDE5IDBMMTkgMUwxOCAxTDE4IDBMMTYgMEwxNiAxTDE1IDFMMTUgMFpNMjcgMEwyNyAxTDI4IDFMMjggMFpNMjkgMEwyOSAxTDMwIDFMMzAgMFpNNDAgMEw0MCAyTDQxIDJMNDEgMFpNMTIgMUwxMiAzTDExIDNMMTEgNEwxMCA0TDEwIDVMMTEgNUwxMSA0TDEyIDRMMTIgM0wxMyAzTDEzIDVMMTQgNUwxNCA2TDEzIDZMMTMgN0wxMiA3TDEyIDZMMTEgNkwxMSA3TDEyIDdMMTIgOUwxMyA5TDEzIDhMMTQgOEwxNCA2TDE1IDZMMTUgOUwxNCA5TDE0IDE0TDE1IDE0TDE1IDEzTDE2IDEzTDE2IDE0TDE3IDE0TDE3IDExTDE2IDExTDE2IDEwTDE4IDEwTDE4IDEzTDE5IDEzTDE5IDE0TDE4IDE0TDE4IDE2TDE2IDE2TDE2IDE3TDE5IDE3TDE5IDE2TDIxIDE2TDIxIDE4TDIwIDE4TDIwIDE5TDIxIDE5TDIxIDIxTDIyIDIxTDIyIDIyTDIxIDIyTDIxIDIzTDE5IDIzTDE5IDIyTDIwIDIyTDIwIDIxTDE5IDIxTDE5IDIyTDE4IDIyTDE4IDIzTDE5IDIzTDE5IDI1TDIxIDI1TDIxIDIzTDIyIDIzTDIyIDI1TDIzIDI1TDIzIDI3TDIyIDI3TDIyIDI2TDIxIDI2TDIxIDI3TDE4IDI3TDE4IDI4TDE3IDI4TDE3IDMwTDE1IDMwTDE1IDI5TDE2IDI5TDE2IDI4TDE1IDI4TDE1IDI3TDEzIDI3TDEzIDI1TDE0IDI1TDE0IDI0TDExIDI0TDExIDIyTDEwIDIyTDEwIDIzTDkgMjNMOSAyNEwxMCAyNEwxMCAyNUw4IDI1TDggMjZMMTAgMjZMMTAgMjhMMTEgMjhMMTEgMjlMMTMgMjlMMTMgMjhMMTQgMjhMMTQgMzBMMTEgMzBMMTEgMzFMMTUgMzFMMTUgMzNMMTYgMzNMMTYgMzJMMTcgMzJMMTcgMzNMMTkgMzNMMTkgMzJMMjEgMzJMMjEgMzFMMTkgMzFMMTkgMjhMMjEgMjhMMjEgMjdMMjIgMjdMMjIgMjhMMjMgMjhMMjMgMjlMMjAgMjlMMjAgMzBMMjIgMzBMMjIgMzJMMjMgMzJMMjMgMzNMMjUgMzNMMjUgMzJMMjMgMzJMMjMgMzFMMjYgMzFMMjYgMzJMMjcgMzJMMjcgMjlMMjUgMjlMMjUgMzBMMjMgMzBMMjMgMjlMMjQgMjlMMjQgMjhMMjYgMjhMMjYgMjdMMjcgMjdMMjcgMjVMMjUgMjVMMjUgMjRMMjggMjRMMjggMjVMMzAgMjVMMzAgMjZMMjggMjZMMjggMjdMMjkgMjdMMjkgMjhMMzAgMjhMMzAgMjZMMzIgMjZMMzIgMjVMMzMgMjVMMzMgMjZMMzUgMjZMMzUgMjhMMzMgMjhMMzMgMjdMMzEgMjdMMzEgMjhMMzMgMjhMMzMgMzBMMzQgMzBMMzQgMzJMMzMgMzJMMzMgMzNMMzIgMzNMMzIgMzRMMzQgMzRMMzQgMzZMMzMgMzZMMzMgMzdMMzAgMzdMMzAgMzZMMzIgMzZMMzIgMzVMMzAgMzVMMzAgMzNMMjkgMzNMMjkgMzZMMjggMzZMMjggMzVMMjcgMzVMMjcgMzZMMjYgMzZMMjYgMzVMMjQgMzVMMjQgMzZMMjIgMzZMMjIgMzdMMjEgMzdMMjEgMzZMMTkgMzZMMTkgMzVMMjIgMzVMMjIgMzNMMjAgMzNMMjAgMzRMMTkgMzRMMTkgMzVMMTggMzVMMTggMzZMMTkgMzZMMTkgMzhMMTggMzhMMTggMzdMMTcgMzdMMTcgMzlMMTIgMzlMMTIgMzhMMTQgMzhMMTQgMzZMMTUgMzZMMTUgMzdMMTYgMzdMMTYgMzZMMTUgMzZMMTUgMzVMMTYgMzVMMTYgMzRMMTUgMzRMMTUgMzVMMTQgMzVMMTQgMzZMMTMgMzZMMTMgMzVMMTIgMzVMMTIgMzNMMTMgMzNMMTMgMzJMMTIgMzJMMTIgMzNMMTAgMzNMMTAgMzFMOSAzMUw5IDM0TDcgMzRMNyAzM0w2IDMzTDYgMzRMNSAzNEw1IDM1TDYgMzVMNiAzNkw3IDM2TDcgMzVMOCAzNUw4IDM3TDkgMzdMOSAzNEwxMCAzNEwxMCAzOUw5IDM5TDkgNDBMOCA0MEw4IDQyTDkgNDJMOSA0M0wxMCA0M0wxMCA0NEwxMSA0NEwxMSA0M0wxMiA0M0wxMiA0MUwxMyA0MUwxMyA0MEwxNSA0MEwxNSA0M0wxNiA0M0wxNiA0NUwxNSA0NUwxNSA0NkwxMyA0NkwxMyA0NUw5IDQ1TDkgNDhMMTEgNDhMMTEgNTBMMTAgNTBMMTAgNDlMOSA0OUw5IDUwTDEwIDUwTDEwIDUxTDkgNTFMOSA1Mkw4IDUyTDggNTNMOSA1M0w5IDU0TDEyIDU0TDEyIDUzTDEzIDUzTDEzIDU1TDEwIDU1TDEwIDU2TDExIDU2TDExIDU3TDEwIDU3TDEwIDU4TDEyIDU4TDEyIDU2TDEzIDU2TDEzIDU1TDE0IDU1TDE0IDU2TDE1IDU2TDE1IDU3TDE2IDU3TDE2IDU2TDE4IDU2TDE4IDU4TDE5IDU4TDE5IDU5TDIwIDU5TDIwIDU4TDE5IDU4TDE5IDU3TDIxIDU3TDIxIDU4TDIyIDU4TDIyIDU5TDIxIDU5TDIxIDYwTDIzIDYwTDIzIDU3TDIyIDU3TDIyIDU1TDIxIDU1TDIxIDU0TDIyIDU0TDIyIDUyTDIxIDUyTDIxIDUxTDIyIDUxTDIyIDUwTDIxIDUwTDIxIDQ5TDIyIDQ5TDIyIDQ4TDIxIDQ4TDIxIDQ3TDIzIDQ3TDIzIDUxTDI0IDUxTDI0IDUyTDI1IDUyTDI1IDU1TDI3IDU1TDI3IDUyTDMxIDUyTDMxIDQ5TDMyIDQ5TDMyIDUxTDMzIDUxTDMzIDUzTDM0IDUzTDM0IDU0TDMzIDU0TDMzIDU2TDM1IDU2TDM1IDU3TDM2IDU3TDM2IDU4TDM4IDU4TDM4IDU5TDM5IDU5TDM5IDU4TDM4IDU4TDM4IDU3TDM3IDU3TDM3IDU2TDM1IDU2TDM1IDU1TDM2IDU1TDM2IDU0TDM1IDU0TDM1IDUyTDM0IDUyTDM0IDUxTDMzIDUxTDMzIDQ5TDMyIDQ5TDMyIDQ4TDMwIDQ4TDMwIDQ5TDI5IDQ5TDI5IDUwTDI3IDUwTDI3IDQ4TDI2IDQ4TDI2IDQ1TDI1IDQ1TDI1IDQ2TDIxIDQ2TDIxIDQ3TDIwIDQ3TDIwIDQ1TDIyIDQ1TDIyIDQ0TDIwIDQ0TDIwIDQzTDIxIDQzTDIxIDQyTDE5IDQyTDE5IDQxTDIxIDQxTDIxIDQwTDIwIDQwTDIwIDM3TDIxIDM3TDIxIDM4TDIzIDM4TDIzIDM5TDIyIDM5TDIyIDQwTDI1IDQwTDI1IDQxTDIyIDQxTDIyIDQzTDI0IDQzTDI0IDQ0TDIzIDQ0TDIzIDQ1TDI0IDQ1TDI0IDQ0TDI1IDQ0TDI1IDQzTDI2IDQzTDI2IDQ0TDI3IDQ0TDI3IDQzTDI4IDQzTDI4IDQ1TDI3IDQ1TDI3IDQ2TDI5IDQ2TDI5IDQ0TDMxIDQ0TDMxIDQzTDM0IDQzTDM0IDQyTDM1IDQyTDM1IDQwTDM0IDQwTDM0IDM5TDMzIDM5TDMzIDM3TDM0IDM3TDM0IDM2TDM1IDM2TDM1IDM0TDM2IDM0TDM2IDMzTDM3IDMzTDM3IDMyTDM4IDMyTDM4IDMzTDM5IDMzTDM5IDM3TDM2IDM3TDM2IDM4TDM3IDM4TDM3IDQwTDQwIDQwTDQwIDQxTDM4IDQxTDM4IDQzTDM3IDQzTDM3IDQ1TDM4IDQ1TDM4IDQ0TDQwIDQ0TDQwIDQ1TDQxIDQ1TDQxIDQ0TDQwIDQ0TDQwIDQzTDM5IDQzTDM5IDQyTDQwIDQyTDQwIDQxTDQxIDQxTDQxIDQyTDQyIDQyTDQyIDQzTDQzIDQzTDQzIDQ0TDQ0IDQ0TDQ0IDQzTDQzIDQzTDQzIDQyTDQyIDQyTDQyIDQwTDQxIDQwTDQxIDM5TDQ0IDM5TDQ0IDQwTDQzIDQwTDQzIDQxTDQ1IDQxTDQ1IDM5TDQ2IDM5TDQ2IDQwTDQ5IDQwTDQ5IDQyTDUwIDQyTDUwIDQzTDUxIDQzTDUxIDQwTDQ5IDQwTDQ5IDM5TDUwIDM5TDUwIDM4TDUxIDM4TDUxIDM5TDU0IDM5TDU0IDQwTDUyIDQwTDUyIDQzTDUzIDQzTDUzIDQxTDU0IDQxTDU0IDQwTDU1IDQwTDU1IDM5TDU0IDM5TDU0IDM4TDU1IDM4TDU1IDM3TDU2IDM3TDU2IDQwTDU4IDQwTDU4IDM5TDU3IDM5TDU3IDM4TDU4IDM4TDU4IDM3TDU2IDM3TDU2IDM2TDU3IDM2TDU3IDM1TDU2IDM1TDU2IDMzTDU0IDMzTDU0IDM0TDU1IDM0TDU1IDM3TDU0IDM3TDU0IDM4TDUzIDM4TDUzIDM2TDU0IDM2TDU0IDM1TDUzIDM1TDUzIDM0TDUyIDM0TDUyIDM3TDUxIDM3TDUxIDM2TDUwIDM2TDUwIDM4TDQ5IDM4TDQ5IDM3TDQ4IDM3TDQ4IDM4TDQ5IDM4TDQ5IDM5TDQ2IDM5TDQ2IDM4TDQ3IDM4TDQ3IDM2TDQ5IDM2TDQ5IDM1TDUwIDM1TDUwIDMzTDUxIDMzTDUxIDMyTDUyIDMyTDUyIDMwTDUxIDMwTDUxIDI4TDUwIDI4TDUwIDI3TDQ4IDI3TDQ4IDI2TDUxIDI2TDUxIDI1TDQ3IDI1TDQ3IDI0TDQ2IDI0TDQ2IDIzTDQ1IDIzTDQ1IDI0TDQ2IDI0TDQ2IDI1TDQ0IDI1TDQ0IDI2TDQ3IDI2TDQ3IDI5TDQ2IDI5TDQ2IDMxTDQ3IDMxTDQ3IDMwTDQ5IDMwTDQ5IDMxTDQ4IDMxTDQ4IDMyTDQ5IDMyTDQ5IDMzTDQ3IDMzTDQ3IDMyTDQ0IDMyTDQ0IDMxTDQzIDMxTDQzIDMwTDQ0IDMwTDQ0IDI5TDQ1IDI5TDQ1IDI4TDQ2IDI4TDQ2IDI3TDQ0IDI3TDQ0IDI4TDQyIDI4TDQyIDI3TDQzIDI3TDQzIDI2TDQxIDI2TDQxIDI4TDQwIDI4TDQwIDI5TDM5IDI5TDM5IDI4TDM4IDI4TDM4IDI3TDM3IDI3TDM3IDI4TDM2IDI4TDM2IDI1TDM3IDI1TDM3IDI0TDM4IDI0TDM4IDIzTDM3IDIzTDM3IDI0TDM0IDI0TDM0IDIxTDMyIDIxTDMyIDE5TDM0IDE5TDM0IDIwTDM1IDIwTDM1IDIxTDM2IDIxTDM2IDIyTDM3IDIyTDM3IDIwTDM1IDIwTDM1IDE5TDM3IDE5TDM3IDE4TDM5IDE4TDM5IDE3TDM4IDE3TDM4IDE2TDM5IDE2TDM5IDE0TDM3IDE0TDM3IDE1TDM4IDE1TDM4IDE2TDM2IDE2TDM2IDE1TDM1IDE1TDM1IDEyTDM4IDEyTDM4IDEzTDQxIDEzTDQxIDEyTDQyIDEyTDQyIDEzTDQzIDEzTDQzIDE0TDQxIDE0TDQxIDE2TDQwIDE2TDQwIDIwTDM5IDIwTDM5IDE5TDM4IDE5TDM4IDIwTDM5IDIwTDM5IDIxTDQwIDIxTDQwIDIyTDQxIDIyTDQxIDE4TDQyIDE4TDQyIDIxTDQzIDIxTDQzIDIwTDQ0IDIwTDQ0IDE5TDQzIDE5TDQzIDE4TDQ0IDE4TDQ0IDE3TDQ1IDE3TDQ1IDE2TDQ2IDE2TDQ2IDE1TDQ0IDE1TDQ0IDE2TDQzIDE2TDQzIDE0TDQ1IDE0TDQ1IDEzTDQ2IDEzTDQ2IDE0TDQ3IDE0TDQ3IDE1TDQ4IDE1TDQ4IDE2TDQ5IDE2TDQ5IDE1TDQ4IDE1TDQ4IDE0TDQ5IDE0TDQ5IDEzTDQ4IDEzTDQ4IDEyTDUwIDEyTDUwIDE0TDUzIDE0TDUzIDEzTDU0IDEzTDU0IDEyTDUzIDEyTDUzIDExTDQ4IDExTDQ4IDEwTDUwIDEwTDUwIDlMNDggOUw0OCA4TDQ3IDhMNDcgN0w0OCA3TDQ4IDVMNDcgNUw0NyA0TDQ4IDRMNDggM0w0NyAzTDQ3IDRMNDUgNEw0NSA3TDQ2IDdMNDYgOEw0NCA4TDQ0IDZMNDMgNkw0MyA1TDQ0IDVMNDQgNEw0MyA0TDQzIDVMNDIgNUw0MiA2TDQxIDZMNDEgN0w0MCA3TDQwIDZMMzkgNkwzOSA3TDQwIDdMNDAgOEwzOSA4TDM5IDEwTDM4IDEwTDM4IDExTDM1IDExTDM1IDEyTDM0IDEyTDM0IDEwTDM1IDEwTDM1IDlMMzQgOUwzNCAxMEwzMyAxMEwzMyA5TDMyIDlMMzIgMTBMMzEgMTBMMzEgOUwyOCA5TDI4IDhMMjcgOEwyNyA3TDI4IDdMMjggNkwyNyA2TDI3IDdMMjYgN0wyNiA1TDI1IDVMMjUgMkwyNCAyTDI0IDRMMjMgNEwyMyA1TDI1IDVMMjUgN0wyNiA3TDI2IDhMMjcgOEwyNyA5TDI2IDlMMjYgMTBMMjQgMTBMMjQgMTFMMjUgMTFMMjUgMTJMMjYgMTJMMjYgMTNMMjcgMTNMMjcgMTRMMjUgMTRMMjUgMTNMMjQgMTNMMjQgMTJMMjMgMTJMMjMgMTNMMjQgMTNMMjQgMTZMMjUgMTZMMjUgMTdMMjQgMTdMMjQgMTlMMjMgMTlMMjMgMjBMMjIgMjBMMjIgMTlMMjEgMTlMMjEgMThMMjIgMThMMjIgMTZMMjEgMTZMMjEgMTVMMjAgMTVMMjAgMTJMMjEgMTJMMjEgMTFMMjAgMTFMMjAgOUwxOSA5TDE5IDhMMjEgOEwyMSAxMEwyMiAxMEwyMiA4TDI0IDhMMjQgNkwyMyA2TDIzIDdMMjIgN0wyMiA4TDIxIDhMMjEgN0wyMCA3TDIwIDVMMTggNUwxOCA0TDE2IDRMMTYgMkwxOCAyTDE4IDFMMTYgMUwxNiAyTDE1IDJMMTUgMUwxNCAxTDE0IDNMMTMgM0wxMyAxWk0zMSAxTDMxIDJMMzIgMkwzMiAzTDMzIDNMMzMgMkwzNCAyTDM0IDFMMzMgMUwzMyAyTDMyIDJMMzIgMVpNNDQgMUw0NCAyTDQzIDJMNDMgM0w0NCAzTDQ0IDJMNDUgMkw0NSAzTDQ2IDNMNDYgMkw0NSAyTDQ1IDFaTTM2IDJMMzYgM0wzNSAzTDM1IDRMMzYgNEwzNiAzTDM3IDNMMzcgMlpNNTEgM0w1MSA0TDUyIDRMNTIgM1pNMTQgNEwxNCA1TDE1IDVMMTUgNkwxNiA2TDE2IDlMMTUgOUwxNSAxMEwxNiAxMEwxNiA5TDE4IDlMMTggOEwxOSA4TDE5IDZMMTggNkwxOCA3TDE3IDdMMTcgNkwxNiA2TDE2IDRaTTI5IDVMMjkgOEwzMiA4TDMyIDVaTTQ2IDVMNDYgN0w0NyA3TDQ3IDVaTTggNkw4IDhMOSA4TDkgNlpNMzAgNkwzMCA3TDMxIDdMMzEgNlpNNDIgNkw0MiA3TDQxIDdMNDEgOEw0MiA4TDQyIDdMNDMgN0w0MyA2Wk01MiA2TDUyIDdMNTMgN0w1MyA2Wk00MyA4TDQzIDEwTDQyIDEwTDQyIDlMNDEgOUw0MSAxMEwzOSAxMEwzOSAxMUw0MCAxMUw0MCAxMkw0MSAxMkw0MSAxMEw0MiAxMEw0MiAxMkw0MyAxMkw0MyAxM0w0NSAxM0w0NSAxMUw0NyAxMUw0NyAxMEw0OCAxMEw0OCA5TDQ3IDlMNDcgOEw0NiA4TDQ2IDEwTDQ1IDEwTDQ1IDlMNDQgOUw0NCA4Wk0yNyA5TDI3IDExTDI2IDExTDI2IDEyTDI3IDEyTDI3IDEzTDI4IDEzTDI4IDE0TDI3IDE0TDI3IDE1TDI2IDE1TDI2IDE2TDI3IDE2TDI3IDE3TDMwIDE3TDMwIDE5TDI5IDE5TDI5IDIwTDI4IDIwTDI4IDIxTDI2IDIxTDI2IDIwTDI1IDIwTDI1IDE5TDI2IDE5TDI2IDE3TDI1IDE3TDI1IDE5TDI0IDE5TDI0IDIwTDIzIDIwTDIzIDIyTDIyIDIyTDIyIDIzTDIzIDIzTDIzIDI1TDI0IDI1TDI0IDI0TDI1IDI0TDI1IDIzTDI4IDIzTDI4IDI0TDI5IDI0TDI5IDIzTDI4IDIzTDI4IDIyTDMwIDIyTDMwIDIwTDMxIDIwTDMxIDE3TDMyIDE3TDMyIDE4TDM0IDE4TDM0IDE3TDM1IDE3TDM1IDE4TDM2IDE4TDM2IDE3TDM1IDE3TDM1IDE1TDM0IDE1TDM0IDE0TDMzIDE0TDMzIDE1TDMxIDE1TDMxIDE0TDMyIDE0TDMyIDEzTDMzIDEzTDMzIDEyTDMyIDEyTDMyIDExTDMzIDExTDMzIDEwTDMyIDEwTDMyIDExTDMwIDExTDMwIDEwTDI5IDEwTDI5IDExTDI4IDExTDI4IDlaTTUxIDlMNTEgMTBMNTIgMTBMNTIgOVpNNTYgOUw1NiAxMEw1NyAxMEw1NyAxMUw1OCAxMUw1OCAxMkw1NyAxMkw1NyAxM0w1NiAxM0w1NiAxNEw1NyAxNEw1NyAxNUw1NiAxNUw1NiAxOEw1NyAxOEw1NyAxN0w1OCAxN0w1OCAxNkw1NyAxNkw1NyAxNUw1OSAxNUw1OSAxN0w2MCAxN0w2MCAxNUw1OSAxNUw1OSAxNEw1OCAxNEw1OCAxMkw1OSAxMkw1OSA5TDU4IDlMNTggMTBMNTcgMTBMNTcgOVpNNTQgMTBMNTQgMTFMNTUgMTFMNTUgMTJMNTYgMTJMNTYgMTFMNTUgMTFMNTUgMTBaTTE1IDExTDE1IDEyTDE2IDEyTDE2IDExWk0yNyAxMUwyNyAxMkwyOCAxMkwyOCAxMVpNMjkgMTFMMjkgMTRMMjggMTRMMjggMTVMMjcgMTVMMjcgMTZMMjggMTZMMjggMTVMMzAgMTVMMzAgMTZMMzEgMTZMMzEgMTVMMzAgMTVMMzAgMTFaTTQzIDExTDQzIDEyTDQ0IDEyTDQ0IDExWk0xIDEyTDEgMTNMMiAxM0wyIDEyWk0zMSAxMkwzMSAxM0wzMiAxM0wzMiAxMlpNOSAxM0w5IDE0TDEwIDE0TDEwIDEzWk0yMiAxNEwyMiAxNUwyMyAxNUwyMyAxNFpNNiAxNUw2IDE2TDcgMTZMNyAxNVpNMzMgMTVMMzMgMTZMMzIgMTZMMzIgMTdMMzQgMTdMMzQgMTVaTTQyIDE3TDQyIDE4TDQzIDE4TDQzIDE3Wk0yNyAxOEwyNyAxOUwyOCAxOUwyOCAxOFpNNDcgMThMNDcgMjBMNDggMjBMNDggMjFMNDkgMjFMNDkgMjBMNDggMjBMNDggMTlMNTAgMTlMNTAgMThaTTI0IDIwTDI0IDIxTDI1IDIxTDI1IDIyTDI0IDIyTDI0IDIzTDI1IDIzTDI1IDIyTDI2IDIyTDI2IDIxTDI1IDIxTDI1IDIwWk0zMSAyMUwzMSAyMkwzMiAyMkwzMiAyMVpNMiAyMkwyIDI1TDMgMjVMMyAyNEw0IDI0TDQgMjNMMyAyM0wzIDIyWk0zMCAyM0wzMCAyNEwzMyAyNEwzMyAyM1pNNDggMjNMNDggMjRMNDkgMjRMNDkgMjNaTTU5IDI0TDU5IDI1TDYxIDI1TDYxIDI0Wk0xMSAyNUwxMSAyNkwxMiAyNkwxMiAyNVpNMTcgMjVMMTcgMjZMMTggMjZMMTggMjVaTTUzIDI1TDUzIDI3TDUyIDI3TDUyIDI4TDU0IDI4TDU0IDI3TDU1IDI3TDU1IDI2TDU0IDI2TDU0IDI1Wk0yNCAyNkwyNCAyN0wyMyAyN0wyMyAyOEwyNCAyOEwyNCAyN0wyNiAyN0wyNiAyNlpNNjAgMjZMNjAgMjdMNjEgMjdMNjEgMjZaTTYgMjdMNiAyOEw4IDI4TDggMjdaTTExIDI3TDExIDI4TDEyIDI4TDEyIDI3Wk01NiAyN0w1NiAyOEw1NyAyOEw1NyAyN1pNMzUgMjhMMzUgMzFMMzYgMzFMMzYgMzBMMzggMzBMMzggMjhMMzcgMjhMMzcgMjlMMzYgMjlMMzYgMjhaTTQ4IDI4TDQ4IDI5TDUwIDI5TDUwIDI4Wk01IDI5TDUgMzJMOCAzMkw4IDI5Wk0yOSAyOUwyOSAzMkwzMiAzMkwzMiAyOVpNNDIgMjlMNDIgMzBMNDMgMzBMNDMgMjlaTTUzIDI5TDUzIDMyTDU2IDMyTDU2IDI5Wk01OCAyOUw1OCAzMEw1OSAzMEw1OSAzMUw1OCAzMUw1OCAzMkw1OSAzMkw1OSAzMUw2MCAzMUw2MCAzMEw1OSAzMEw1OSAyOVpNNiAzMEw2IDMxTDcgMzFMNyAzMFpNMTcgMzBMMTcgMzJMMTggMzJMMTggMzBaTTMwIDMwTDMwIDMxTDMxIDMxTDMxIDMwWk01MCAzMEw1MCAzMUw0OSAzMUw0OSAzMkw1MCAzMkw1MCAzMUw1MSAzMUw1MSAzMFpNNTQgMzBMNTQgMzFMNTUgMzFMNTUgMzBaTTM4IDMxTDM4IDMyTDQxIDMyTDQxIDMxWk00MiAzMUw0MiAzMkw0MyAzMkw0MyAzMVpNMSAzMkwxIDMzTDAgMzNMMCAzNEwxIDM0TDEgMzNMMyAzM0wzIDMyWk0zNCAzM0wzNCAzNEwzNSAzNEwzNSAzM1pNNDEgMzNMNDEgMzRMNDMgMzRMNDMgMzdMNDAgMzdMNDAgMzlMNDEgMzlMNDEgMzhMNDQgMzhMNDQgMzdMNDYgMzdMNDYgMzZMNDQgMzZMNDQgMzVMNDcgMzVMNDcgMzNMNDQgMzNMNDQgMzRMNDMgMzRMNDMgMzNaTTU3IDMzTDU3IDM0TDU4IDM0TDU4IDMzWk02IDM0TDYgMzVMNyAzNUw3IDM0Wk00OCAzNEw0OCAzNUw0OSAzNUw0OSAzNFpNMzcgMzVMMzcgMzZMMzggMzZMMzggMzVaTTQxIDM1TDQxIDM2TDQyIDM2TDQyIDM1Wk01OCAzNUw1OCAzNkw1OSAzNkw1OSAzNVpNMTEgMzZMMTEgMzdMMTMgMzdMMTMgMzZaTTI0IDM2TDI0IDM3TDIzIDM3TDIzIDM4TDI1IDM4TDI1IDM2Wk0yNiAzN0wyNiAzOEwyNyAzOEwyNyAzOUwyNSAzOUwyNSA0MEwyNyA0MEwyNyA0MUwyOCA0MUwyOCA0M0wyOSA0M0wyOSA0MUwzMCA0MUwzMCA0M0wzMSA0M0wzMSA0MUwzMiA0MUwzMiA0MEwzMCA0MEwzMCAzOUwzMSAzOUwzMSAzOEwzMCAzOEwzMCAzN1pNNiAzOEw2IDM5TDcgMzlMNyAzOFpNMjkgMzhMMjkgMzlMMzAgMzlMMzAgMzhaTTM4IDM4TDM4IDM5TDM5IDM5TDM5IDM4Wk0wIDM5TDAgNDFMMSA0MUwxIDM5Wk05IDQwTDkgNDJMMTAgNDJMMTAgNDFMMTIgNDFMMTIgNDBaTTE4IDQwTDE4IDQxTDE2IDQxTDE2IDQyTDE3IDQyTDE3IDQzTDE4IDQzTDE4IDQxTDE5IDQxTDE5IDQwWk02IDQxTDYgNDJMNyA0Mkw3IDQxWk0yNSA0MUwyNSA0MkwyNiA0MkwyNiA0M0wyNyA0M0wyNyA0MkwyNiA0MkwyNiA0MVpNMzYgNDFMMzYgNDJMMzcgNDJMMzcgNDFaTTQgNDJMNCA0M0w1IDQzTDUgNDJaTTEzIDQyTDEzIDQzTDE0IDQzTDE0IDQyWk02IDQzTDYgNDRMOCA0NEw4IDQzWk00OCA0M0w0OCA0NEw0OSA0NEw0OSA0M1pNMTggNDRMMTggNDZMMTcgNDZMMTcgNDVMMTYgNDVMMTYgNDZMMTcgNDZMMTcgNDdMMTYgNDdMMTYgNDhMMTUgNDhMMTUgNDdMMTIgNDdMMTIgNDZMMTAgNDZMMTAgNDdMMTIgNDdMMTIgNTBMMTUgNTBMMTUgNTFMMTYgNTFMMTYgNDhMMTcgNDhMMTcgNDdMMTkgNDdMMTkgNDRaTTUzIDQ0TDUzIDQ1TDUyIDQ1TDUyIDQ2TDUxIDQ2TDUxIDQ3TDUwIDQ3TDUwIDQ4TDUxIDQ4TDUxIDQ3TDUyIDQ3TDUyIDUyTDUzIDUyTDUzIDUwTDU0IDUwTDU0IDQ4TDU1IDQ4TDU1IDQ3TDUyIDQ3TDUyIDQ2TDU1IDQ2TDU1IDQ1TDU2IDQ1TDU2IDQ0TDU1IDQ0TDU1IDQ1TDU0IDQ1TDU0IDQ0Wk02IDQ1TDYgNDZMNyA0Nkw3IDQ3TDggNDdMOCA0Nkw3IDQ2TDcgNDVaTTQxIDQ2TDQxIDUwTDQyIDUwTDQyIDQ5TDQ0IDQ5TDQ0IDQ3TDQzIDQ3TDQzIDQ2Wk0yNCA0N0wyNCA0OEwyNSA0OEwyNSA0N1pNNDIgNDdMNDIgNDhMNDMgNDhMNDMgNDdaTTE0IDQ4TDE0IDQ5TDE1IDQ5TDE1IDQ4Wk0xOCA0OEwxOCA0OUwxOSA0OUwxOSA0OFpNMiA0OUwyIDUwTDMgNTBMMyA0OVpNNCA0OUw0IDUwTDUgNTBMNSA0OVpNNiA0OUw2IDUwTDggNTBMOCA0OVpNMjUgNDlMMjUgNTBMMjYgNTBMMjYgNDlaTTUwIDQ5TDUwIDUwTDUxIDUwTDUxIDQ5Wk0xNyA1MEwxNyA1MUwxOCA1MUwxOCA1MFpNMTkgNTBMMTkgNTFMMjEgNTFMMjEgNTBaTTMgNTFMMyA1Mkw0IDUyTDQgNTFaTTEzIDUxTDEzIDUyTDE0IDUyTDE0IDUzTDE2IDUzTDE2IDU0TDE1IDU0TDE1IDU2TDE2IDU2TDE2IDU0TDE3IDU0TDE3IDU1TDE4IDU1TDE4IDUzTDE5IDUzTDE5IDU1TDIwIDU1TDIwIDU2TDIxIDU2TDIxIDU1TDIwIDU1TDIwIDU0TDIxIDU0TDIxIDUzTDIwIDUzTDIwIDUyTDE3IDUyTDE3IDUzTDE2IDUzTDE2IDUyTDE0IDUyTDE0IDUxWk0yNSA1MUwyNSA1MkwyNiA1MkwyNiA1MVpNNDUgNTFMNDUgNTJMNDQgNTJMNDQgNTNMNDMgNTNMNDMgNTRMNDQgNTRMNDQgNTNMNDUgNTNMNDUgNTJMNDYgNTJMNDYgNTFaTTU1IDUxTDU1IDUyTDU2IDUyTDU2IDUxWk0yMyA1M0wyMyA1NEwyNCA1NEwyNCA1M1pNMjkgNTNMMjkgNTZMMzIgNTZMMzIgNTNaTTUzIDUzTDUzIDU2TDU2IDU2TDU2IDUzWk0zMCA1NEwzMCA1NUwzMSA1NUwzMSA1NFpNNTQgNTRMNTQgNTVMNTUgNTVMNTUgNTRaTTU2IDU3TDU2IDU5TDU3IDU5TDU3IDU3Wk0yNCA1OUwyNCA2MEwyNSA2MEwyNSA1OVpNMzMgNjBMMzMgNjFMMzUgNjFMMzUgNjBaTTQ4IDYwTDQ4IDYxTDUwIDYxTDUwIDYwWk0wIDBMMCA3TDcgN0w3IDBaTTEgMUwxIDZMNiA2TDYgMVpNMiAyTDIgNUw1IDVMNSAyWk01NCAwTDU0IDdMNjEgN0w2MSAwWk01NSAxTDU1IDZMNjAgNkw2MCAxWk01NiAyTDU2IDVMNTkgNUw1OSAyWk0wIDU0TDAgNjFMNyA2MUw3IDU0Wk0xIDU1TDEgNjBMNiA2MEw2IDU1Wk0yIDU2TDIgNTlMNSA1OUw1IDU2WiIgZmlsbD0iIzAwMDAwMCIvPjwvZz48L2c+PC9zdmc+Cg==	data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyIgPz4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+DQo8c3ZnIHdpZHRoPSIyMzciIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCAyMzcgODAiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCgk8ZGVzYz4wMDAwMDAwNTwvZGVzYz4NCgk8ZyBpZD0iYmFycyIgZmlsbD0icmdiKDAsMCwwKSIgc3Ryb2tlPSJub25lIj4NCgkJPHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjYiIGhlaWdodD0iODAiIC8+DQoJCTxyZWN0IHg9IjkiIHk9IjAiIHdpZHRoPSIzIiBoZWlnaHQ9IjgwIiAvPg0KCQk8cmVjdCB4PSIxOCIgeT0iMCIgd2lkdGg9IjkiIGhlaWdodD0iODAiIC8+DQoJCTxyZWN0IHg9IjMzIiB5PSIwIiB3aWR0aD0iNiIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iNDIiIHk9IjAiIHdpZHRoPSI2IiBoZWlnaHQ9IjgwIiAvPg0KCQk8cmVjdCB4PSI1NCIgeT0iMCIgd2lkdGg9IjYiIGhlaWdodD0iODAiIC8+DQoJCTxyZWN0IHg9IjY2IiB5PSIwIiB3aWR0aD0iNiIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iNzUiIHk9IjAiIHdpZHRoPSI2IiBoZWlnaHQ9IjgwIiAvPg0KCQk8cmVjdCB4PSI4NyIgeT0iMCIgd2lkdGg9IjYiIGhlaWdodD0iODAiIC8+DQoJCTxyZWN0IHg9Ijk5IiB5PSIwIiB3aWR0aD0iNiIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMTA4IiB5PSIwIiB3aWR0aD0iNiIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMTIwIiB5PSIwIiB3aWR0aD0iNiIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMTMyIiB5PSIwIiB3aWR0aD0iMyIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMTQ0IiB5PSIwIiB3aWR0aD0iMyIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMTUzIiB5PSIwIiB3aWR0aD0iNiIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMTY1IiB5PSIwIiB3aWR0aD0iNiIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMTc3IiB5PSIwIiB3aWR0aD0iOSIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMTg5IiB5PSIwIiB3aWR0aD0iMyIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMTk4IiB5PSIwIiB3aWR0aD0iNiIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMjEzIiB5PSIwIiB3aWR0aD0iOSIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMjI1IiB5PSIwIiB3aWR0aD0iMyIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMjMxIiB5PSIwIiB3aWR0aD0iNiIgaGVpZ2h0PSI4MCIgLz4NCgk8L2c+DQo8L3N2Zz4NCg==
6	APC UPS 650 VA	3	APC	23d3d3ee	1716.44	1de233232311132	2024-06-19	3500	2026-02-16	3	2	5	\N	2	2025-12-16 02:07:41	2025-12-29 01:50:26	data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZlcnNpb249IjEuMSIgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIHZpZXdCb3g9IjAgMCAzMDAgMzAwIj48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2ZmZmZmZiIvPjxnIHRyYW5zZm9ybT0ic2NhbGUoNC45MTgpIj48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgwLDApIj48cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0xMSAwTDExIDJMMTMgMkwxMyAzTDEyIDNMMTIgNEwxNCA0TDE0IDJMMTUgMkwxNSAzTDE3IDNMMTcgMkwxOCAyTDE4IDBMMTYgMEwxNiAyTDE1IDJMMTUgMEwxNCAwTDE0IDJMMTMgMkwxMyAwWk0yMyAwTDIzIDJMMjIgMkwyMiAxTDIxIDFMMjEgMkwyMCAyTDIwIDFMMTkgMUwxOSAyTDIwIDJMMjAgM0wxOSAzTDE5IDRMMjEgNEwyMSA2TDIwIDZMMjAgOUwxOSA5TDE5IDhMMTUgOEwxNSA1TDE2IDVMMTYgNEwxNSA0TDE1IDVMMTMgNUwxMyA2TDEyIDZMMTIgN0wxMSA3TDExIDVMMTAgNUwxMCA3TDExIDdMMTEgOEwxMCA4TDEwIDlMOSA5TDkgMTBMOCAxMEw4IDhMOSA4TDkgNUw4IDVMOCA4TDQgOEw0IDlMMyA5TDMgMTBMMSAxMEwxIDlMMCA5TDAgMTFMMSAxMUwxIDEyTDAgMTJMMCAxNEwxIDE0TDEgMTJMMiAxMkwyIDE0TDMgMTRMMyAxMkw0IDEyTDQgMTNMNyAxM0w3IDE0TDYgMTRMNiAxNUw3IDE1TDcgMTZMNSAxNkw1IDE0TDQgMTRMNCAxNkwwIDE2TDAgMTdMMyAxN0wzIDE5TDIgMTlMMiAyMEwxIDIwTDEgMjFMMCAyMUwwIDIyTDEgMjJMMSAyM0wwIDIzTDAgMjVMMSAyNUwxIDI2TDAgMjZMMCAyN0wxIDI3TDEgMjhMMiAyOEwyIDI5TDEgMjlMMSAzMEwyIDMwTDIgMjlMMyAyOUwzIDMwTDQgMzBMNCAzMUwyIDMxTDIgMzJMMSAzMkwxIDMxTDAgMzFMMCAzM0wxIDMzTDEgMzRMNCAzNEw0IDM2TDMgMzZMMyAzN0wxIDM3TDEgNDBMMyA0MEwzIDQxTDIgNDFMMiA0MkwxIDQyTDEgNDFMMCA0MUwwIDQyTDEgNDJMMSA0M0wwIDQzTDAgNDZMMSA0NkwxIDQ1TDIgNDVMMiA0NkwzIDQ2TDMgNDhMMiA0OEwyIDQ3TDEgNDdMMSA0OEwwIDQ4TDAgNTBMMiA1MEwyIDUxTDAgNTFMMCA1M0w0IDUzTDQgNTJMNSA1Mkw1IDUxTDEwIDUxTDEwIDUyTDkgNTJMOSA1M0w4IDUzTDggNTdMMTAgNTdMMTAgNTlMMTEgNTlMMTEgNTdMMTAgNTdMMTAgNTZMMTIgNTZMMTIgNTVMMTEgNTVMMTEgNTRMMTAgNTRMMTAgNTNMMTIgNTNMMTIgNTRMMTUgNTRMMTUgNTVMMTYgNTVMMTYgNTZMMTQgNTZMMTQgNTdMMTYgNTdMMTYgNThMMTUgNThMMTUgNjBMMTcgNjBMMTcgNTlMMTggNTlMMTggNjBMMTkgNjBMMTkgNjFMMjMgNjFMMjMgNThMMjQgNThMMjQgNTdMMjUgNTdMMjUgNTZMMjYgNTZMMjYgNThMMjUgNThMMjUgNTlMMjQgNTlMMjQgNjBMMjUgNjBMMjUgNTlMMjYgNTlMMjYgNThMMjcgNThMMjcgNTdMMjkgNTdMMjkgNThMMjggNThMMjggNTlMMjcgNTlMMjcgNjBMMjYgNjBMMjYgNjFMMjggNjFMMjggNTlMMzAgNTlMMzAgNThMMzEgNThMMzEgNTdMMzIgNTdMMzIgNThMMzMgNThMMzMgNTlMMzEgNTlMMzEgNjBMMzMgNjBMMzMgNTlMMzQgNTlMMzQgNjFMMzggNjFMMzggNjBMMzkgNjBMMzkgNTlMMzggNTlMMzggNThMMzkgNThMMzkgNTZMNDAgNTZMNDAgNTVMNDEgNTVMNDEgNTRMNDAgNTRMNDAgNTJMNDEgNTJMNDEgNTNMNDIgNTNMNDIgNTRMNDQgNTRMNDQgNTNMNDUgNTNMNDUgNTFMNDYgNTFMNDYgNTNMNDcgNTNMNDcgNThMNDggNThMNDggNTlMNDYgNTlMNDYgNTVMNDIgNTVMNDIgNTZMNDEgNTZMNDEgNjBMNDIgNjBMNDIgNTlMNDMgNTlMNDMgNTdMNDUgNTdMNDUgNTlMNDQgNTlMNDQgNjFMNDYgNjFMNDYgNjBMNDcgNjBMNDcgNjFMNTAgNjFMNTAgNjBMNDkgNjBMNDkgNTlMNTEgNTlMNTEgNjFMNTUgNjFMNTUgNjBMNTYgNjBMNTYgNTdMNTcgNTdMNTcgNTVMNTggNTVMNTggNTZMNTkgNTZMNTkgNTRMNjAgNTRMNjAgNTNMNjEgNTNMNjEgNTFMNTggNTFMNTggNTNMNTkgNTNMNTkgNTRMNTcgNTRMNTcgNTJMNTIgNTJMNTIgNTNMNTEgNTNMNTEgNTJMNTAgNTJMNTAgNTNMNDkgNTNMNDkgNTFMNTIgNTFMNTIgNDlMNTAgNDlMNTAgNDhMNDkgNDhMNDkgNTBMNDggNTBMNDggNTFMNDYgNTFMNDYgNTBMNDUgNTBMNDUgNDlMNDYgNDlMNDYgNDhMNDcgNDhMNDcgNDlMNDggNDlMNDggNDZMNDcgNDZMNDcgNDdMNDYgNDdMNDYgNDZMNDUgNDZMNDUgNDNMNDYgNDNMNDYgNDVMNDcgNDVMNDcgNDNMNDggNDNMNDggNDVMNDkgNDVMNDkgNDNMNTAgNDNMNTAgNDJMNTEgNDJMNTEgNDNMNTQgNDNMNTQgNDJMNTYgNDJMNTYgNDNMNTcgNDNMNTcgNDVMNTYgNDVMNTYgNDZMNTUgNDZMNTUgNDdMNTIgNDdMNTIgNDZMNTMgNDZMNTMgNDRMNTIgNDRMNTIgNDZMNTEgNDZMNTEgNDVMNTAgNDVMNTAgNDdMNTIgNDdMNTIgNDhMNTMgNDhMNTMgNDlMNTQgNDlMNTQgNTBMNTYgNTBMNTYgNTFMNTcgNTFMNTcgNDlMNTkgNDlMNTkgNDhMNjAgNDhMNjAgNTBMNjEgNTBMNjEgNDhMNjAgNDhMNjAgNDdMNTggNDdMNTggNDZMNjEgNDZMNjEgNDVMNjAgNDVMNjAgNDRMNjEgNDRMNjEgNDNMNTkgNDNMNTkgNDJMNjAgNDJMNjAgNDFMNjEgNDFMNjEgMzlMNjAgMzlMNjAgMzdMNjEgMzdMNjEgMzVMNTkgMzVMNTkgMzRMNTcgMzRMNTcgMzJMNTggMzJMNTggMzNMNTkgMzNMNTkgMzJMNjAgMzJMNjAgMzNMNjEgMzNMNjEgMzJMNjAgMzJMNjAgMzFMNTcgMzFMNTcgMjZMNTYgMjZMNTYgMjVMNTUgMjVMNTUgMjFMNTcgMjFMNTcgMTlMNTYgMTlMNTYgMThMNTggMThMNTggMjFMNTkgMjFMNTkgMjNMNTcgMjNMNTcgMjJMNTYgMjJMNTYgMjNMNTcgMjNMNTcgMjVMNTkgMjVMNTkgMjZMNjEgMjZMNjEgMjNMNjAgMjNMNjAgMjBMNjEgMjBMNjEgMTZMNjAgMTZMNjAgMTVMNTggMTVMNTggMTJMNTkgMTJMNTkgMTBMNjAgMTBMNjAgOEw1OSA4TDU5IDEwTDU4IDEwTDU4IDEyTDU3IDEyTDU3IDExTDU2IDExTDU2IDEyTDU1IDEyTDU1IDEzTDUzIDEzTDUzIDE0TDUyIDE0TDUyIDEyTDU0IDEyTDU0IDExTDU1IDExTDU1IDEwTDU2IDEwTDU2IDhMNTQgOEw1NCAxMEw1MyAxMEw1MyAxMUw1MiAxMUw1MiA5TDUzIDlMNTMgNkw1MiA2TDUyIDdMNTEgN0w1MSA1TDUyIDVMNTIgNEw1MyA0TDUzIDBMNTEgMEw1MSAyTDUwIDJMNTAgMUw0OSAxTDQ5IDJMNTAgMkw1MCA1TDQ5IDVMNDkgNEw0OCA0TDQ4IDNMNDYgM0w0NiA0TDQ1IDRMNDUgNUw0NCA1TDQ0IDRMNDIgNEw0MiA4TDQzIDhMNDMgMTBMNDQgMTBMNDQgMTJMNDMgMTJMNDMgMTNMMzkgMTNMMzkgMTJMMzggMTJMMzggMTFMMzkgMTFMMzkgMTBMNDAgMTBMNDAgMTFMNDEgMTFMNDEgMTJMNDIgMTJMNDIgOUw0MSA5TDQxIDEwTDQwIDEwTDQwIDhMMzkgOEwzOSA2TDM4IDZMMzggN0wzNyA3TDM3IDNMMzggM0wzOCA0TDM5IDRMMzkgM0w0MSAzTDQxIDJMNDAgMkw0MCAxTDQxIDFMNDEgMEwzOSAwTDM5IDFMMzggMUwzOCAwTDM2IDBMMzYgMUwzNSAxTDM1IDBMMzIgMEwzMiA0TDMxIDRMMzEgM0wzMCAzTDMwIDRMMjkgNEwyOSAyTDMxIDJMMzEgMUwzMCAxTDMwIDBMMjggMEwyOCAxTDI5IDFMMjkgMkwyOCAyTDI4IDNMMjcgM0wyNyA2TDI2IDZMMjYgN0wyNSA3TDI1IDVMMjYgNUwyNiAzTDI1IDNMMjUgMkwyNyAyTDI3IDFMMjUgMUwyNSAwWk00MiAwTDQyIDFMNDUgMUw0NSAyTDQyIDJMNDIgM0w0NSAzTDQ1IDJMNDcgMkw0NyAxTDQ1IDFMNDUgMFpNOCAxTDggMkw5IDJMOSA0TDExIDRMMTEgM0wxMCAzTDEwIDJMOSAyTDkgMVpNMjQgMUwyNCAyTDI1IDJMMjUgMVpNMzQgMUwzNCAyTDMzIDJMMzMgM0wzNCAzTDM0IDJMMzUgMkwzNSAxWk0zNiAxTDM2IDJMMzggMkwzOCAxWk0yMiAzTDIyIDRMMjMgNEwyMyA1TDI0IDVMMjQgNEwyMyA0TDIzIDNaTTUxIDNMNTEgNEw1MiA0TDUyIDNaTTM0IDRMMzQgNUwzMyA1TDMzIDhMMzQgOEwzNCAxMUwzMyAxMUwzMyAxMEwzMiAxMEwzMiAxMUwzMSAxMUwzMSAxMEwzMCAxMEwzMCA5TDI5IDlMMjkgMTBMMjggMTBMMjggMTJMMjkgMTJMMjkgMTFMMzAgMTFMMzAgMTNMMjkgMTNMMjkgMTRMMzAgMTRMMzAgMTVMMjkgMTVMMjkgMTZMMzAgMTZMMzAgMTVMMzEgMTVMMzEgMTZMMzIgMTZMMzIgMTdMMjggMTdMMjggMThMMjYgMThMMjYgMTdMMjcgMTdMMjcgMTZMMjggMTZMMjggMTRMMjcgMTRMMjcgMTBMMjYgMTBMMjYgOUwyNCA5TDI0IDhMMjUgOEwyNSA3TDI0IDdMMjQgNkwyMyA2TDIzIDdMMjIgN0wyMiA2TDIxIDZMMjEgN0wyMiA3TDIyIDhMMjMgOEwyMyA5TDI0IDlMMjQgMTJMMjUgMTJMMjUgMTRMMjQgMTRMMjQgMTNMMjMgMTNMMjMgMTBMMjIgMTBMMjIgMTFMMTkgMTFMMTkgMTJMMTggMTJMMTggMTBMMTUgMTBMMTUgMTFMMTQgMTFMMTQgMTBMMTMgMTBMMTMgOEwxMSA4TDExIDlMMTAgOUwxMCAxMkw5IDEyTDkgMTFMOCAxMUw4IDEwTDcgMTBMNyA5TDQgOUw0IDEwTDUgMTBMNSAxMUw0IDExTDQgMTJMNSAxMkw1IDExTDYgMTFMNiAxMkw3IDEyTDcgMTNMOCAxM0w4IDE0TDcgMTRMNyAxNUw4IDE1TDggMTRMOSAxNEw5IDE2TDggMTZMOCAxN0w5IDE3TDkgMThMNyAxOEw3IDE3TDYgMTdMNiAxOEw3IDE4TDcgMTlMNiAxOUw2IDIwTDUgMjBMNSAxNkw0IDE2TDQgMTlMMyAxOUwzIDIwTDIgMjBMMiAyMUwxIDIxTDEgMjJMMiAyMkwyIDIxTDMgMjFMMyAyMkw0IDIyTDQgMjNMMSAyM0wxIDI1TDUgMjVMNSAyNkw4IDI2TDggMjdMNiAyN0w2IDI4TDggMjhMOCAyN0wxMCAyN0wxMCAyOUw5IDI5TDkgMzBMMTAgMzBMMTAgMzNMMTEgMzNMMTEgMzRMMTIgMzRMMTIgMzNMMTEgMzNMMTEgMzJMMTIgMzJMMTIgMzFMMTUgMzFMMTUgMzJMMTQgMzJMMTQgMzRMMTUgMzRMMTUgMzVMMTQgMzVMMTQgMzZMMTMgMzZMMTMgMzdMMTQgMzdMMTQgMzhMMTIgMzhMMTIgMzZMMTEgMzZMMTEgMzhMMTIgMzhMMTIgMzlMMTAgMzlMMTAgMzhMOSAzOEw5IDM3TDggMzdMOCAzNkwxMCAzNkwxMCAzNUw5IDM1TDkgMzRMOCAzNEw4IDMzTDQgMzNMNCAzNEw1IDM0TDUgMzhMNyAzOEw3IDM3TDggMzdMOCAzOEw5IDM4TDkgMzlMOCAzOUw4IDQwTDEwIDQwTDEwIDQxTDExIDQxTDExIDQyTDkgNDJMOSA0MUw2IDQxTDYgNDBMNyA0MEw3IDM5TDYgMzlMNiA0MEw1IDQwTDUgNDJMMyA0MkwzIDQzTDIgNDNMMiA0NUwzIDQ1TDMgNDZMNyA0Nkw3IDQ3TDYgNDdMNiA0OEw3IDQ4TDcgNDdMOCA0N0w4IDQ2TDkgNDZMOSA0N0wxMSA0N0wxMSA0NkwxMCA0NkwxMCA0NUwxMiA0NUwxMiA0NEwxMyA0NEwxMyA0NkwxNCA0NkwxNCA0N0wxNSA0N0wxNSA0OEwxNCA0OEwxNCA0OUwxMyA0OUwxMyA1MUwxMiA1MUwxMiA1MkwxMyA1MkwxMyA1M0wxNCA1M0wxNCA1MkwxMyA1MkwxMyA1MUwxNSA1MUwxNSA1NEwxNiA1NEwxNiA1NUwxNyA1NUwxNyA1NkwxNiA1NkwxNiA1N0wxNyA1N0wxNyA1OEwxOCA1OEwxOCA1OUwxOSA1OUwxOSA2MEwyMCA2MEwyMCA1OUwyMSA1OUwyMSA1OEwyMiA1OEwyMiA1N0wyMCA1N0wyMCA1NkwyMSA1NkwyMSA1NEwyMiA1NEwyMiA1M0wyMyA1M0wyMyA1NEwyNyA1NEwyNyA1NUwyNiA1NUwyNiA1NkwyNyA1NkwyNyA1NUwyOCA1NUwyOCA1MkwzMiA1MkwzMiA1MUwzMCA1MUwzMCA1MEwzMyA1MEwzMyA1MUwzNCA1MUwzNCA1M0wzMyA1M0wzMyA1NEwzNCA1NEwzNCA1NUwzNSA1NUwzNSA1NkwzMyA1NkwzMyA1N0wzNCA1N0wzNCA1OEwzNSA1OEwzNSA1OUwzNiA1OUwzNiA1OEwzOCA1OEwzOCA1N0wzNyA1N0wzNyA1NUwzOCA1NUwzOCA1NkwzOSA1NkwzOSA1NUw0MCA1NUw0MCA1NEwzOCA1NEwzOCA1M0wzOSA1M0wzOSA1Mkw0MCA1Mkw0MCA1MUwzOCA1MUwzOCA1MEwzNyA1MEwzNyA1M0wzNSA1M0wzNSA1MEwzNiA1MEwzNiA0OUwzNCA0OUwzNCA0OEwzNiA0OEwzNiA0N0wzOCA0N0wzOCA0NUwzNiA0NUwzNiA0NEwzNSA0NEwzNSA0N0wzNCA0N0wzNCA0M0wzNSA0M0wzNSA0MkwzMyA0MkwzMyA0MUwzNCA0MUwzNCAzN0wzNSAzN0wzNSA0MUwzNiA0MUwzNiA0M0wzNyA0M0wzNyA0NEwzOSA0NEwzOSA0Nkw0MCA0Nkw0MCA0N0w0MSA0N0w0MSA0OEw0MCA0OEw0MCA0OUwzOSA0OUwzOSA0OEwzNyA0OEwzNyA0OUwzOSA0OUwzOSA1MEw0MCA1MEw0MCA0OUw0MiA0OUw0MiA1Mkw0MyA1Mkw0MyA0OEw0NCA0OEw0NCA0N0w0NSA0N0w0NSA0OEw0NiA0OEw0NiA0N0w0NSA0N0w0NSA0Nkw0NCA0Nkw0NCA0M0w0NSA0M0w0NSA0MUw0NiA0MUw0NiA0MEw0NyA0MEw0NyAzN0w0OCAzN0w0OCAzOUw0OSAzOUw0OSA0MEw1MSA0MEw1MSA0MUw1MiA0MUw1MiA0Mkw1MyA0Mkw1MyA0MUw1NCA0MUw1NCAzOUw1NSAzOUw1NSA0MEw1NiA0MEw1NiA0MUw1NyA0MUw1NyA0M0w1OCA0M0w1OCA0Mkw1OSA0Mkw1OSA0MUw2MCA0MUw2MCAzOUw1OSAzOUw1OSAzN0w2MCAzN0w2MCAzNkw1OCAzNkw1OCAzNUw1NSAzNUw1NSAzNEw1NiAzNEw1NiAzM0w1MiAzM0w1MiAzNEw1NCAzNEw1NCAzNUw1NSAzNUw1NSAzNkw1NiAzNkw1NiAzN0w1NyAzN0w1NyAzOEw1OCAzOEw1OCAzOUw1OSAzOUw1OSA0MUw1NyA0MUw1NyAzOUw1NSAzOUw1NSAzOEw1NCAzOEw1NCAzN0w1MyAzN0w1MyAzNkw1MiAzNkw1MiAzNUw1MSAzNUw1MSAzNkw1MCAzNkw1MCAzN0w0OCAzN0w0OCAzNkw0NiAzNkw0NiAzNUw1MCAzNUw1MCAzNEw0NyAzNEw0NyAzMkw0OCAzMkw0OCAzMUw0NyAzMUw0NyAzMEw0OSAzMEw0OSAyOUw1MCAyOUw1MCAyOEw1MSAyOEw1MSAyOUw1MiAyOUw1MiAyOEw1MyAyOEw1MyAyNkw1NCAyNkw1NCAyM0w1MiAyM0w1MiAyMkw1MyAyMkw1MyAyMUw1NCAyMUw1NCAyMEw1NiAyMEw1NiAxOUw1NCAxOUw1NCAxN0w1NSAxN0w1NSAxOEw1NiAxOEw1NiAxNkw1NSAxNkw1NSAxNUw1NyAxNUw1NyAxN0w1OCAxN0w1OCAxOEw1OSAxOEw1OSAxOUw2MCAxOUw2MCAxNkw1OCAxNkw1OCAxNUw1NyAxNUw1NyAxM0w1NSAxM0w1NSAxNUw1NCAxNUw1NCAxN0w1MiAxN0w1MiAxNEw1MSAxNEw1MSAxNUw1MCAxNUw1MCAxM0w1MSAxM0w1MSAxMUw1MCAxMUw1MCAxMkw0OSAxMkw0OSAxM0w0OCAxM0w0OCAxNEw0NyAxNEw0NyAxM0w0NiAxM0w0NiAxMkw0NSAxMkw0NSAxM0w0NCAxM0w0NCAxNEw0MyAxNEw0MyAxNkw0MSAxNkw0MSAxNEwzOSAxNEwzOSAxM0wzOCAxM0wzOCAxNEwzNyAxNEwzNyAxNUwzNiAxNUwzNiAxNEwzNCAxNEwzNCAxNUwzMyAxNUwzMyAxNEwzMiAxNEwzMiAxNUwzMSAxNUwzMSAxNEwzMCAxNEwzMCAxM0wzMyAxM0wzMyAxMkwzNCAxMkwzNCAxMUwzNSAxMUwzNSAxM0wzNiAxM0wzNiAxMkwzNyAxMkwzNyAxMUwzOCAxMUwzOCAxMEwzNyAxMEwzNyA4TDM2IDhMMzYgMTBMMzUgMTBMMzUgN0wzNiA3TDM2IDVMMzUgNUwzNSA0Wk00NiA0TDQ2IDVMNDUgNUw0NSA3TDQ2IDdMNDYgNUw0NyA1TDQ3IDdMNDggN0w0OCA1TDQ3IDVMNDcgNFpNMTcgNUwxNyA2TDE2IDZMMTYgN0wxNyA3TDE3IDZMMTggNkwxOCA3TDE5IDdMMTkgNkwxOCA2TDE4IDVaTTI5IDVMMjkgOEwzMiA4TDMyIDVaTTM0IDVMMzQgN0wzNSA3TDM1IDVaTTQwIDVMNDAgN0w0MSA3TDQxIDVaTTEzIDZMMTMgN0wxNCA3TDE0IDZaTTI3IDZMMjcgOUwyOCA5TDI4IDZaTTMwIDZMMzAgN0wzMSA3TDMxIDZaTTQzIDZMNDMgOEw0NCA4TDQ0IDZaTTQ5IDZMNDkgOUw1MSA5TDUxIDdMNTAgN0w1MCA2Wk0yMyA3TDIzIDhMMjQgOEwyNCA3Wk0zOCA4TDM4IDlMMzkgOUwzOSA4Wk00NSA4TDQ1IDlMNDQgOUw0NCAxMEw0NSAxMEw0NSAxMUw0OSAxMUw0OSAxMEw0NyAxMEw0NyA4Wk02IDEwTDYgMTFMNyAxMUw3IDEwWk0xMiAxMEwxMiAxMUwxMSAxMUwxMSAxMkwxMCAxMkwxMCAxNEwxMSAxNEwxMSAxM0wxMiAxM0wxMiAxNEwxMyAxNEwxMyAxM0wxNCAxM0wxNCAxMkwxMyAxMkwxMyAxMFpNMzYgMTBMMzYgMTFMMzcgMTFMMzcgMTBaTTIgMTFMMiAxMkwzIDEyTDMgMTFaTTE2IDExTDE2IDEyTDE3IDEyTDE3IDEzTDE2IDEzTDE2IDE0TDE1IDE0TDE1IDE2TDE2IDE2TDE2IDE3TDE0IDE3TDE0IDE1TDEzIDE1TDEzIDE3TDEyIDE3TDEyIDE2TDEwIDE2TDEwIDE4TDExIDE4TDExIDE3TDEyIDE3TDEyIDE5TDEwIDE5TDEwIDIwTDkgMjBMOSAxOUw4IDE5TDggMjBMOSAyMEw5IDIxTDggMjFMOCAyM0w3IDIzTDcgMjJMNSAyMkw1IDI0TDYgMjRMNiAyNUw4IDI1TDggMjNMOSAyM0w5IDIxTDEwIDIxTDEwIDIyTDEyIDIyTDEyIDIzTDEzIDIzTDEzIDIyTDEyIDIyTDEyIDIxTDEwIDIxTDEwIDIwTDEyIDIwTDEyIDE5TDE0IDE5TDE0IDE4TDE2IDE4TDE2IDE5TDE1IDE5TDE1IDIwTDE2IDIwTDE2IDIyTDE3IDIyTDE3IDE5TDE4IDE5TDE4IDIxTDE5IDIxTDE5IDIyTDE4IDIyTDE4IDIzTDIxIDIzTDIxIDI0TDIwIDI0TDIwIDI1TDIxIDI1TDIxIDI2TDIwIDI2TDIwIDI3TDE4IDI3TDE4IDI2TDE5IDI2TDE5IDI0TDE4IDI0TDE4IDI2TDE3IDI2TDE3IDI0TDE1IDI0TDE1IDIzTDE0IDIzTDE0IDI1TDE1IDI1TDE1IDI2TDEzIDI2TDEzIDI1TDEyIDI1TDEyIDI0TDEwIDI0TDEwIDI1TDEyIDI1TDEyIDI2TDEzIDI2TDEzIDI3TDEyIDI3TDEyIDI4TDE0IDI4TDE0IDMwTDE2IDMwTDE2IDMxTDE3IDMxTDE3IDMwTDE5IDMwTDE5IDMxTDE4IDMxTDE4IDMyTDE3IDMyTDE3IDMzTDE2IDMzTDE2IDMyTDE1IDMyTDE1IDM0TDE3IDM0TDE3IDMzTDE5IDMzTDE5IDM0TDE4IDM0TDE4IDM1TDE3IDM1TDE3IDM2TDE0IDM2TDE0IDM3TDE1IDM3TDE1IDM4TDE0IDM4TDE0IDQxTDEyIDQxTDEyIDQwTDEzIDQwTDEzIDM5TDEyIDM5TDEyIDQwTDExIDQwTDExIDQxTDEyIDQxTDEyIDQyTDEzIDQyTDEzIDQzTDE0IDQzTDE0IDQ1TDE1IDQ1TDE1IDQ2TDE2IDQ2TDE2IDUyTDE3IDUyTDE3IDUzTDE2IDUzTDE2IDU0TDE3IDU0TDE3IDUzTDE5IDUzTDE5IDUxTDIxIDUxTDIxIDUyTDIyIDUyTDIyIDUxTDIxIDUxTDIxIDUwTDIyIDUwTDIyIDQ4TDIzIDQ4TDIzIDQ5TDI0IDQ5TDI0IDUwTDIzIDUwTDIzIDUxTDI1IDUxTDI1IDUyTDIzIDUyTDIzIDUzTDI1IDUzTDI1IDUyTDI4IDUyTDI4IDUxTDI5IDUxTDI5IDQ5TDMwIDQ5TDMwIDQ4TDMxIDQ4TDMxIDQ3TDI5IDQ3TDI5IDQ2TDMwIDQ2TDMwIDQ1TDMxIDQ1TDMxIDQ2TDMyIDQ2TDMyIDQ0TDMzIDQ0TDMzIDQyTDMyIDQyTDMyIDQxTDMxIDQxTDMxIDQ0TDI3IDQ0TDI3IDQ1TDI1IDQ1TDI1IDQ0TDI2IDQ0TDI2IDQyTDI4IDQyTDI4IDQzTDI5IDQzTDI5IDQxTDMwIDQxTDMwIDQwTDI5IDQwTDI5IDM5TDMwIDM5TDMwIDM4TDMxIDM4TDMxIDM3TDMwIDM3TDMwIDM4TDI5IDM4TDI5IDM5TDI4IDM5TDI4IDM4TDI3IDM4TDI3IDM3TDI1IDM3TDI1IDM2TDI4IDM2TDI4IDM1TDI5IDM1TDI5IDM2TDMwIDM2TDMwIDM1TDMyIDM1TDMyIDM2TDMzIDM2TDMzIDM3TDM0IDM3TDM0IDM2TDM1IDM2TDM1IDM0TDM3IDM0TDM3IDMzTDM4IDMzTDM4IDM1TDM3IDM1TDM3IDM2TDM5IDM2TDM5IDM3TDM3IDM3TDM3IDM4TDM2IDM4TDM2IDQxTDM3IDQxTDM3IDM5TDM4IDM5TDM4IDQwTDM5IDQwTDM5IDM3TDQwIDM3TDQwIDM4TDQzIDM4TDQzIDM3TDQ0IDM3TDQ0IDM4TDQ1IDM4TDQ1IDM5TDQwIDM5TDQwIDQwTDQ0IDQwTDQ0IDQxTDQyIDQxTDQyIDQyTDQwIDQyTDQwIDQxTDM5IDQxTDM5IDQyTDM3IDQyTDM3IDQzTDM5IDQzTDM5IDQ0TDQwIDQ0TDQwIDQzTDQxIDQzTDQxIDQ0TDQyIDQ0TDQyIDQzTDQzIDQzTDQzIDQyTDQ0IDQyTDQ0IDQxTDQ1IDQxTDQ1IDM5TDQ2IDM5TDQ2IDM4TDQ1IDM4TDQ1IDM3TDQ2IDM3TDQ2IDM2TDQ0IDM2TDQ0IDM1TDQ2IDM1TDQ2IDMzTDQ1IDMzTDQ1IDMxTDQ2IDMxTDQ2IDMyTDQ3IDMyTDQ3IDMxTDQ2IDMxTDQ2IDI5TDQ3IDI5TDQ3IDI4TDQ4IDI4TDQ4IDI5TDQ5IDI5TDQ5IDI3TDUyIDI3TDUyIDI2TDUzIDI2TDUzIDI1TDUxIDI1TDUxIDI0TDUyIDI0TDUyIDIzTDUxIDIzTDUxIDIyTDUyIDIyTDUyIDIxTDUzIDIxTDUzIDIwTDUyIDIwTDUyIDIxTDUwIDIxTDUwIDIwTDQ5IDIwTDQ5IDE5TDUxIDE5TDUxIDE4TDUyIDE4TDUyIDE3TDUwIDE3TDUwIDE2TDQ5IDE2TDQ5IDE0TDQ4IDE0TDQ4IDE1TDQ2IDE1TDQ2IDEzTDQ1IDEzTDQ1IDE1TDQ0IDE1TDQ0IDE3TDQyIDE3TDQyIDE4TDQxIDE4TDQxIDE2TDQwIDE2TDQwIDE4TDM5IDE4TDM5IDE3TDM4IDE3TDM4IDE2TDM5IDE2TDM5IDE1TDM3IDE1TDM3IDE4TDM2IDE4TDM2IDE3TDM1IDE3TDM1IDE4TDM2IDE4TDM2IDE5TDM0IDE5TDM0IDE2TDM2IDE2TDM2IDE1TDM0IDE1TDM0IDE2TDMzIDE2TDMzIDE1TDMyIDE1TDMyIDE2TDMzIDE2TDMzIDE4TDMxIDE4TDMxIDE5TDMwIDE5TDMwIDE4TDI4IDE4TDI4IDE5TDI2IDE5TDI2IDE4TDI1IDE4TDI1IDE5TDI0IDE5TDI0IDIwTDIzIDIwTDIzIDE5TDIyIDE5TDIyIDIwTDIzIDIwTDIzIDIxTDE5IDIxTDE5IDIwTDIxIDIwTDIxIDE1TDIyIDE1TDIyIDE0TDIzIDE0TDIzIDE2TDIyIDE2TDIyIDE3TDIzIDE3TDIzIDE4TDI0IDE4TDI0IDE3TDI1IDE3TDI1IDE2TDI3IDE2TDI3IDE0TDI2IDE0TDI2IDE1TDI1IDE1TDI1IDE2TDI0IDE2TDI0IDE0TDIzIDE0TDIzIDEzTDE5IDEzTDE5IDE0TDE3IDE0TDE3IDEzTDE4IDEzTDE4IDEyTDE3IDEyTDE3IDExWk0yNSAxMUwyNSAxMkwyNiAxMkwyNiAxMVpNMzIgMTFMMzIgMTJMMzMgMTJMMzMgMTFaTTYwIDExTDYwIDEzTDU5IDEzTDU5IDE0TDYwIDE0TDYwIDEzTDYxIDEzTDYxIDExWk04IDEyTDggMTNMOSAxM0w5IDEyWk0xNiAxNEwxNiAxNkwxNyAxNkwxNyAxOEwxOCAxOEwxOCAxOUwyMCAxOUwyMCAxOEwxOCAxOEwxOCAxN0wyMCAxN0wyMCAxNkwxOSAxNkwxOSAxNUwxOCAxNUwxOCAxNkwxNyAxNkwxNyAxNFpNNDUgMTZMNDUgMThMNDQgMThMNDQgMTlMNDIgMTlMNDIgMjBMNDEgMjBMNDEgMTlMMzkgMTlMMzkgMThMMzcgMThMMzcgMTlMMzYgMTlMMzYgMjBMMzcgMjBMMzcgMjFMMzUgMjFMMzUgMjBMMzQgMjBMMzQgMTlMMzMgMTlMMzMgMjFMMzAgMjFMMzAgMTlMMjggMTlMMjggMjBMMjYgMjBMMjYgMjJMMjcgMjJMMjcgMjFMMjkgMjFMMjkgMjJMMzAgMjJMMzAgMjNMMjUgMjNMMjUgMjJMMjQgMjJMMjQgMjNMMjMgMjNMMjMgMjJMMjEgMjJMMjEgMjNMMjMgMjNMMjMgMjRMMjIgMjRMMjIgMjZMMjMgMjZMMjMgMjdMMjQgMjdMMjQgMjhMMjUgMjhMMjUgMzBMMjQgMzBMMjQgMjlMMjMgMjlMMjMgMzBMMjAgMzBMMjAgMjlMMjIgMjlMMjIgMjdMMjAgMjdMMjAgMjlMMTkgMjlMMTkgMjhMMTggMjhMMTggMjdMMTcgMjdMMTcgMjZMMTUgMjZMMTUgMjdMMTYgMjdMMTYgMjhMMTUgMjhMMTUgMjlMMTYgMjlMMTYgMjhMMTggMjhMMTggMjlMMTkgMjlMMTkgMzBMMjAgMzBMMjAgMzJMMjEgMzJMMjEgMzRMMjIgMzRMMjIgMzVMMjAgMzVMMjAgMzZMMjQgMzZMMjQgMzVMMjYgMzVMMjYgMzRMMjggMzRMMjggMzJMMjcgMzJMMjcgMzNMMjYgMzNMMjYgMzJMMjUgMzJMMjUgMzBMMjcgMzBMMjcgMzFMMjggMzFMMjggMjlMMjYgMjlMMjYgMjhMMjggMjhMMjggMjZMMjkgMjZMMjkgMjVMMjggMjVMMjggMjZMMjcgMjZMMjcgMjVMMjYgMjVMMjYgMjRMMzAgMjRMMzAgMjhMMzEgMjhMMzEgMjdMMzIgMjdMMzIgMjhMMzQgMjhMMzQgMjlMMzMgMjlMMzMgMzBMMzQgMzBMMzQgMzJMMzYgMzJMMzYgMzNMMzcgMzNMMzcgMzJMMzggMzJMMzggMzFMNDIgMzFMNDIgMzJMNDAgMzJMNDAgMzNMMzkgMzNMMzkgMzRMNDIgMzRMNDIgMzNMNDMgMzNMNDMgMzJMNDQgMzJMNDQgMzFMNDUgMzFMNDUgMjlMNDYgMjlMNDYgMjhMNDcgMjhMNDcgMjVMNDggMjVMNDggMjNMNTAgMjNMNTAgMjRMNTEgMjRMNTEgMjNMNTAgMjNMNTAgMjFMNDcgMjFMNDcgMjBMNDggMjBMNDggMTlMNDkgMTlMNDkgMThMNTAgMThMNTAgMTdMNDkgMTdMNDkgMThMNDggMThMNDggMTlMNDcgMTlMNDcgMTdMNDYgMTdMNDYgMTZaTTEzIDE3TDEzIDE4TDE0IDE4TDE0IDE3Wk0wIDE4TDAgMTlMMSAxOUwxIDE4Wk0zNyAxOUwzNyAyMEwzOCAyMEwzOCAxOVpNNDQgMTlMNDQgMjJMNDUgMjJMNDUgMjFMNDYgMjFMNDYgMjBMNDcgMjBMNDcgMTlaTTMgMjBMMyAyMUw0IDIxTDQgMjBaTTYgMjBMNiAyMUw3IDIxTDcgMjBaTTI0IDIwTDI0IDIxTDI1IDIxTDI1IDIwWk00MiAyMEw0MiAyMkw0MSAyMkw0MSAyMUw0MCAyMUw0MCAyMkwzOCAyMkwzOCAyMUwzNyAyMUwzNyAyMkwzNiAyMkwzNiAyNEwzNCAyNEwzNCAyM0wzNSAyM0wzNSAyMUwzMyAyMUwzMyAyMkwzMiAyMkwzMiAyM0wzMyAyM0wzMyAyNEwzNCAyNEwzNCAyNUwzMiAyNUwzMiAyNEwzMSAyNEwzMSAyNUwzMiAyNUwzMiAyNkwzNCAyNkwzNCAyOEwzNSAyOEwzNSAyOUwzNiAyOUwzNiAzMEwzNyAzMEwzNyAyOUwzNiAyOUwzNiAyOEwzNyAyOEwzNyAyN0wzOSAyN0wzOSAyNkwzNyAyNkwzNyAyNUw0MSAyNUw0MSAyNkw0MCAyNkw0MCAyOEw0MSAyOEw0MSAyOUw0MiAyOUw0MiAzMUw0MyAzMUw0MyAzMEw0NCAzMEw0NCAyOUw0NSAyOUw0NSAyN0w0NiAyN0w0NiAyNkw0NSAyNkw0NSAyNUw0NiAyNUw0NiAyM0w0MyAyM0w0MyAyMFpNMTQgMjFMMTQgMjJMMTUgMjJMMTUgMjFaTTMzIDIyTDMzIDIzTDM0IDIzTDM0IDIyWk0zNyAyMkwzNyAyNEw0MSAyNEw0MSAyNUw0MiAyNUw0MiAyM0wzOCAyM0wzOCAyMlpNNDcgMjJMNDcgMjNMNDggMjNMNDggMjJaTTYgMjNMNiAyNEw3IDI0TDcgMjNaTTIzIDI0TDIzIDI2TDI0IDI2TDI0IDI3TDI1IDI3TDI1IDI4TDI2IDI4TDI2IDI3TDI3IDI3TDI3IDI2TDI2IDI2TDI2IDI1TDI1IDI1TDI1IDI0Wk01OSAyNEw1OSAyNUw2MCAyNUw2MCAyNFpNMjQgMjVMMjQgMjZMMjUgMjZMMjUgMjdMMjYgMjdMMjYgMjZMMjUgMjZMMjUgMjVaTTM0IDI1TDM0IDI2TDM2IDI2TDM2IDI3TDM1IDI3TDM1IDI4TDM2IDI4TDM2IDI3TDM3IDI3TDM3IDI2TDM2IDI2TDM2IDI1Wk00MyAyNUw0MyAyNkw0MSAyNkw0MSAyOEw0MyAyOEw0MyAyNkw0NCAyNkw0NCAyN0w0NSAyN0w0NSAyNkw0NCAyNkw0NCAyNVpNMSAyNkwxIDI3TDIgMjdMMiAyOEwzIDI4TDMgMjlMNCAyOUw0IDI2TDMgMjZMMyAyN0wyIDI3TDIgMjZaTTEwIDI2TDEwIDI3TDExIDI3TDExIDI2Wk00OCAyNkw0OCAyN0w0OSAyN0w0OSAyNlpNNTQgMjdMNTQgMjhMNTYgMjhMNTYgMjdaTTU4IDI3TDU4IDI5TDU5IDI5TDU5IDMwTDYxIDMwTDYxIDI4TDYwIDI4TDYwIDI5TDU5IDI5TDU5IDI3Wk01IDI5TDUgMzJMOCAzMkw4IDI5Wk0xMiAyOUwxMiAzMEwxMyAzMEwxMyAyOVpNMjkgMjlMMjkgMzJMMzIgMzJMMzIgMjlaTTM4IDI5TDM4IDMwTDM5IDMwTDM5IDI5Wk01MyAyOUw1MyAzMkw1NiAzMkw1NiAyOVpNNiAzMEw2IDMxTDcgMzFMNyAzMFpNMjMgMzBMMjMgMzFMMjIgMzFMMjIgMzRMMjUgMzRMMjUgMzNMMjMgMzNMMjMgMzFMMjQgMzFMMjQgMzBaTTMwIDMwTDMwIDMxTDMxIDMxTDMxIDMwWk01MCAzMEw1MCAzMkw1MSAzMkw1MSAzMUw1MiAzMUw1MiAzMFpNNTQgMzBMNTQgMzFMNTUgMzFMNTUgMzBaTTMwIDMzTDMwIDM0TDMxIDM0TDMxIDMzWk0zMiAzM0wzMiAzNUwzMyAzNUwzMyAzNkwzNCAzNkwzNCAzNUwzMyAzNUwzMyAzNEwzNCAzNEwzNCAzM1pNNiAzNEw2IDM1TDcgMzVMNyAzNFpNMCAzNUwwIDM2TDIgMzZMMiAzNVpNMTggMzVMMTggMzZMMTkgMzZMMTkgMzVaTTQyIDM1TDQyIDM2TDQxIDM2TDQxIDM3TDQzIDM3TDQzIDM1Wk02IDM2TDYgMzdMNyAzN0w3IDM2Wk0zIDM3TDMgMzhMMiAzOEwyIDM5TDMgMzlMMyA0MEw0IDQwTDQgMzdaTTE3IDM3TDE3IDM4TDE2IDM4TDE2IDM5TDE1IDM5TDE1IDQyTDE0IDQyTDE0IDQzTDE1IDQzTDE1IDQ1TDE3IDQ1TDE3IDQ3TDE5IDQ3TDE5IDUwTDIwIDUwTDIwIDQ5TDIxIDQ5TDIxIDQ4TDIwIDQ4TDIwIDQ3TDE5IDQ3TDE5IDQ2TDE4IDQ2TDE4IDQ1TDE3IDQ1TDE3IDQ0TDE5IDQ0TDE5IDQ1TDIyIDQ1TDIyIDQ2TDIxIDQ2TDIxIDQ3TDIyIDQ3TDIyIDQ2TDIzIDQ2TDIzIDQ1TDI0IDQ1TDI0IDQzTDI1IDQzTDI1IDQyTDI2IDQyTDI2IDQxTDI3IDQxTDI3IDM4TDI1IDM4TDI1IDM3TDI0IDM3TDI0IDM4TDI1IDM4TDI1IDQwTDI0IDQwTDI0IDM5TDIzIDM5TDIzIDM3TDIwIDM3TDIwIDM4TDE5IDM4TDE5IDM5TDE3IDM5TDE3IDM4TDE4IDM4TDE4IDM3Wk01MCAzN0w1MCAzOUw1MSAzOUw1MSAzN1pNNTIgMzdMNTIgMzlMNTQgMzlMNTQgMzhMNTMgMzhMNTMgMzdaTTMyIDM4TDMyIDM5TDMxIDM5TDMxIDQwTDMyIDQwTDMyIDM5TDMzIDM5TDMzIDM4Wk0xNiAzOUwxNiA0MEwxNyA0MEwxNyA0MkwxNSA0MkwxNSA0M0wxNiA0M0wxNiA0NEwxNyA0NEwxNyA0M0wxOSA0M0wxOSA0NEwyMiA0NEwyMiA0M0wyMyA0M0wyMyA0MUwyNCA0MUwyNCA0MkwyNSA0MkwyNSA0MUwyNCA0MUwyNCA0MEwyMyA0MEwyMyA0MUwyMiA0MUwyMiA0MkwyMSA0MkwyMSA0MUwxOCA0MUwxOCA0MEwxNyA0MEwxNyAzOVpNMjAgMzlMMjAgNDBMMjIgNDBMMjIgMzlaTTQ5IDQxTDQ5IDQyTDQ4IDQyTDQ4IDQzTDQ5IDQzTDQ5IDQyTDUwIDQyTDUwIDQxWk02IDQyTDYgNDNMNSA0M0w1IDQ1TDcgNDVMNyA0Nkw4IDQ2TDggNDRMNiA0NEw2IDQzTDcgNDNMNyA0MlpNOCA0Mkw4IDQzTDkgNDNMOSA0NEwxMSA0NEwxMSA0M0w5IDQzTDkgNDJaTTE5IDQyTDE5IDQzTDIwIDQzTDIwIDQyWk0zIDQ0TDMgNDVMNCA0NUw0IDQ0Wk01NCA0NEw1NCA0NUw1NSA0NUw1NSA0NFpNNTggNDRMNTggNDVMNTcgNDVMNTcgNDZMNTYgNDZMNTYgNDdMNTUgNDdMNTUgNDlMNTcgNDlMNTcgNDhMNTggNDhMNTggNDdMNTcgNDdMNTcgNDZMNTggNDZMNTggNDVMNTkgNDVMNTkgNDRaTTQwIDQ1TDQwIDQ2TDQxIDQ2TDQxIDQ1Wk00MiA0NUw0MiA0OEw0MyA0OEw0MyA0N0w0NCA0N0w0NCA0Nkw0MyA0Nkw0MyA0NVpNMjUgNDZMMjUgNDdMMjYgNDdMMjYgNDhMMjUgNDhMMjUgNTFMMjggNTFMMjggNTBMMjcgNTBMMjcgNDdMMjYgNDdMMjYgNDZaTTEyIDQ3TDEyIDQ4TDggNDhMOCA0OUw2IDQ5TDYgNTBMMTAgNTBMMTAgNDlMMTIgNDlMMTIgNDhMMTMgNDhMMTMgNDdaTTMzIDQ3TDMzIDQ4TDM0IDQ4TDM0IDQ3Wk0zIDQ4TDMgNDlMNCA0OUw0IDUwTDUgNTBMNSA0OFpNMTcgNDhMMTcgNTFMMTggNTFMMTggNDhaTTI4IDQ4TDI4IDQ5TDI5IDQ5TDI5IDQ4Wk00NCA1MEw0NCA1MUw0NSA1MUw0NSA1MFpNMyA1MUwzIDUyTDQgNTJMNCA1MVpNNiA1Mkw2IDUzTDcgNTNMNyA1MlpNNTkgNTJMNTkgNTNMNjAgNTNMNjAgNTJaTTIwIDUzTDIwIDU0TDE5IDU0TDE5IDU1TDIwIDU1TDIwIDU0TDIxIDU0TDIxIDUzWk0yOSA1M0wyOSA1NkwzMiA1NkwzMiA1M1pNMzQgNTNMMzQgNTRMMzUgNTRMMzUgNTVMMzYgNTVMMzYgNTRMMzUgNTRMMzUgNTNaTTQ4IDUzTDQ4IDU1TDQ5IDU1TDQ5IDUzWk01MyA1M0w1MyA1Nkw1NiA1Nkw1NiA1M1pNMzAgNTRMMzAgNTVMMzEgNTVMMzEgNTRaTTU0IDU0TDU0IDU1TDU1IDU1TDU1IDU0Wk0yMiA1NUwyMiA1NkwyMyA1NkwyMyA1N0wyNCA1N0wyNCA1NVpNNTEgNTVMNTEgNTZMNDkgNTZMNDkgNThMNTAgNThMNTAgNTdMNTEgNTdMNTEgNThMNTIgNThMNTIgNTVaTTE3IDU2TDE3IDU3TDE4IDU3TDE4IDU4TDE5IDU4TDE5IDU5TDIwIDU5TDIwIDU3TDE4IDU3TDE4IDU2Wk00MiA1Nkw0MiA1N0w0MyA1N0w0MyA1NlpNNjAgNTZMNjAgNThMNTggNThMNTggNTlMNTcgNTlMNTcgNjBMNTggNjBMNTggNjFMNjEgNjFMNjEgNjBMNjAgNjBMNjAgNThMNjEgNThMNjEgNTZaTTM1IDU3TDM1IDU4TDM2IDU4TDM2IDU3Wk01MyA1N0w1MyA1OEw1NCA1OEw1NCA1OUw1MyA1OUw1MyA2MEw1NSA2MEw1NSA1OEw1NCA1OEw1NCA1N1pNMTIgNThMMTIgNTlMMTQgNTlMMTQgNThaTTkgNjBMOSA2MUwxMSA2MUwxMSA2MFpNMTIgNjBMMTIgNjFMMTQgNjFMMTQgNjBaTTI5IDYwTDI5IDYxTDMwIDYxTDMwIDYwWk0wIDBMMCA3TDcgN0w3IDBaTTEgMUwxIDZMNiA2TDYgMVpNMiAyTDIgNUw1IDVMNSAyWk01NCAwTDU0IDdMNjEgN0w2MSAwWk01NSAxTDU1IDZMNjAgNkw2MCAxWk01NiAyTDU2IDVMNTkgNUw1OSAyWk0wIDU0TDAgNjFMNyA2MUw3IDU0Wk0xIDU1TDEgNjBMNiA2MEw2IDU1Wk0yIDU2TDIgNTlMNSA1OUw1IDU2WiIgZmlsbD0iIzAwMDAwMCIvPjwvZz48L2c+PC9zdmc+Cg==	data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyIgPz4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+DQo8c3ZnIHdpZHRoPSIyMzciIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCAyMzcgODAiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCgk8ZGVzYz4wMDAwMDAwNjwvZGVzYz4NCgk8ZyBpZD0iYmFycyIgZmlsbD0icmdiKDAsMCwwKSIgc3Ryb2tlPSJub25lIj4NCgkJPHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjYiIGhlaWdodD0iODAiIC8+DQoJCTxyZWN0IHg9IjkiIHk9IjAiIHdpZHRoPSIzIiBoZWlnaHQ9IjgwIiAvPg0KCQk8cmVjdCB4PSIxOCIgeT0iMCIgd2lkdGg9IjkiIGhlaWdodD0iODAiIC8+DQoJCTxyZWN0IHg9IjMzIiB5PSIwIiB3aWR0aD0iNiIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iNDIiIHk9IjAiIHdpZHRoPSI2IiBoZWlnaHQ9IjgwIiAvPg0KCQk8cmVjdCB4PSI1NCIgeT0iMCIgd2lkdGg9IjYiIGhlaWdodD0iODAiIC8+DQoJCTxyZWN0IHg9IjY2IiB5PSIwIiB3aWR0aD0iNiIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iNzUiIHk9IjAiIHdpZHRoPSI2IiBoZWlnaHQ9IjgwIiAvPg0KCQk8cmVjdCB4PSI4NyIgeT0iMCIgd2lkdGg9IjYiIGhlaWdodD0iODAiIC8+DQoJCTxyZWN0IHg9Ijk5IiB5PSIwIiB3aWR0aD0iNiIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMTA4IiB5PSIwIiB3aWR0aD0iNiIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMTIwIiB5PSIwIiB3aWR0aD0iNiIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMTMyIiB5PSIwIiB3aWR0aD0iMyIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMTQxIiB5PSIwIiB3aWR0aD0iNiIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMTUzIiB5PSIwIiB3aWR0aD0iMyIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMTY1IiB5PSIwIiB3aWR0aD0iOSIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMTgwIiB5PSIwIiB3aWR0aD0iMyIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMTg5IiB5PSIwIiB3aWR0aD0iNiIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMTk4IiB5PSIwIiB3aWR0aD0iNiIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMjEzIiB5PSIwIiB3aWR0aD0iOSIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMjI1IiB5PSIwIiB3aWR0aD0iMyIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMjMxIiB5PSIwIiB3aWR0aD0iNiIgaGVpZ2h0PSI4MCIgLz4NCgk8L2c+DQo8L3N2Zz4NCg==
12	APC 650VA	3	APC	12122231	2484.02	U-001-2025-1766374492938-QTRYJ7G6	2025-12-22	2500	2026-04-16	3	2	1	\N	3	2025-12-22 03:35:21	2025-12-29 01:50:26	data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZlcnNpb249IjEuMSIgd2lkdGg9IjYwMCIgaGVpZ2h0PSI2MDAiIHZpZXdCb3g9IjAgMCA2MDAgNjAwIj48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iNjAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iI2ZmZmZmZiIvPjxnIHRyYW5zZm9ybT0ic2NhbGUoNi4xODYpIj48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyLDIpIj48cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0xMSAwTDExIDFMMTIgMUwxMiAwWk0xMyAwTDEzIDJMMTIgMkwxMiAzTDExIDNMMTEgNEwxMCA0TDEwIDJMOSAyTDkgMUw4IDFMOCAyTDkgMkw5IDRMMTAgNEwxMCA3TDkgN0w5IDVMOCA1TDggOEw0IDhMNCAxMEwyIDEwTDIgOUwwIDlMMCAxMEwxIDEwTDEgMTFMMCAxMUwwIDEyTDEgMTJMMSAxM0wwIDEzTDAgMTRMMSAxNEwxIDE1TDAgMTVMMCAxN0wxIDE3TDEgMTZMMiAxNkwyIDE0TDQgMTRMNCAxNUw1IDE1TDUgMTNMMyAxM0wzIDEyTDQgMTJMNCAxMEw1IDEwTDUgMTFMOSAxMUw5IDEyTDYgMTJMNiAxM0w5IDEzTDkgMTVMNyAxNUw3IDE0TDYgMTRMNiAxNUw3IDE1TDcgMTZMMyAxNkwzIDE3TDQgMTdMNCAxOEwzIDE4TDMgMjBMMiAyMEwyIDE5TDEgMTlMMSAxOEwwIDE4TDAgMjBMMSAyMEwxIDIzTDIgMjNMMiAyNkwzIDI2TDMgMjdMMiAyN0wyIDI4TDEgMjhMMSAyN0wwIDI3TDAgMjhMMSAyOEwxIDMwTDAgMzBMMCAzMUwzIDMxTDMgMzJMNCAzMkw0IDMzTDggMzNMOCAzOUw3IDM5TDcgMzhMNiAzOEw2IDM3TDcgMzdMNyAzNkw2IDM2TDYgMzdMNSAzN0w1IDM1TDcgMzVMNyAzNEw0IDM0TDQgMzVMMyAzNUwzIDM0TDIgMzRMMiAzNkwzIDM2TDMgMzdMNSAzN0w1IDM5TDcgMzlMNyA0MEw2IDQwTDYgNDFMNSA0MUw1IDQwTDMgNDBMMyAzOUw0IDM5TDQgMzhMMyAzOEwzIDM5TDIgMzlMMiA0MkwxIDQyTDEgNDFMMCA0MUwwIDQyTDEgNDJMMSA0M0wyIDQzTDIgNDRMMSA0NEwxIDQ1TDIgNDVMMiA0NEw0IDQ0TDQgNDVMMyA0NUwzIDQ2TDEgNDZMMSA0OEwwIDQ4TDAgNTFMMSA1MUwxIDUzTDMgNTNMMyA1MkwyIDUyTDIgNTFMMyA1MUwzIDUwTDEgNTBMMSA0OEwyIDQ4TDIgNDlMNSA0OUw1IDUwTDQgNTBMNCA1M0w1IDUzTDUgNTRMMCA1NEwwIDU1TDEgNTVMMSA1N0wyIDU3TDIgNThMMSA1OEwxIDU5TDMgNTlMMyA1N0w0IDU3TDQgNjBMMSA2MEwxIDYxTDAgNjFMMCA2MkwxIDYyTDEgNjNMMCA2M0wwIDY1TDIgNjVMMiA2NkwzIDY2TDMgNjdMMSA2N0wxIDY2TDAgNjZMMCA2N0wxIDY3TDEgNjlMMiA2OUwyIDcwTDAgNzBMMCA3MkwxIDcyTDEgNzNMMCA3M0wwIDc0TDEgNzRMMSA3NUwzIDc1TDMgNzRMNCA3NEw0IDc2TDMgNzZMMyA3N0w1IDc3TDUgNzlMNyA3OUw3IDgwTDQgODBMNCA4MUwzIDgxTDMgNzlMNCA3OUw0IDc4TDEgNzhMMSA3N0wyIDc3TDIgNzZMMCA3NkwwIDc5TDIgNzlMMiA4MEwwIDgwTDAgODJMMiA4MkwyIDgxTDMgODFMMyA4Mkw0IDgyTDQgODNMMyA4M0wzIDg0TDIgODRMMiA4M0wwIDgzTDAgODRMMSA4NEwxIDg1TDMgODVMMyA4NEw2IDg0TDYgODVMOCA4NUw4IDg5TDkgODlMOSA5MUwxMCA5MUwxMCA5Mkw5IDkyTDkgOTNMMTAgOTNMMTAgOTJMMTEgOTJMMTEgOTFMMTIgOTFMMTIgOTJMMTMgOTJMMTMgOTNMMTQgOTNMMTQgOTJMMTMgOTJMMTMgOTFMMTYgOTFMMTYgODhMMTcgODhMMTcgOTBMMTggOTBMMTggOTFMMTkgOTFMMTkgOTBMMjAgOTBMMjAgOTFMMjEgOTFMMjEgOTJMMjAgOTJMMjAgOTNMMjIgOTNMMjIgOTJMMjMgOTJMMjMgOTNMMjQgOTNMMjQgOTJMMjUgOTJMMjUgOTNMMjYgOTNMMjYgOTJMMjggOTJMMjggOTBMMjkgOTBMMjkgODlMMzAgODlMMzAgOTBMMzEgOTBMMzEgOTFMMzIgOTFMMzIgODlMMzQgODlMMzQgOTBMMzYgOTBMMzYgOTFMMzUgOTFMMzUgOTNMMzYgOTNMMzYgOTFMMzcgOTFMMzcgOTBMMzkgOTBMMzkgODlMNDMgODlMNDMgODhMNDQgODhMNDQgODlMNDUgODlMNDUgOTBMNDQgOTBMNDQgOTFMNDUgOTFMNDUgOTJMNDQgOTJMNDQgOTNMNDUgOTNMNDUgOTJMNDYgOTJMNDYgOTNMNDcgOTNMNDcgOTJMNDYgOTJMNDYgODlMNDUgODlMNDUgODhMNDQgODhMNDQgODZMNDUgODZMNDUgODdMNDYgODdMNDYgODZMNDcgODZMNDcgODVMNDggODVMNDggODZMNDkgODZMNDkgODdMNDcgODdMNDcgODhMNDggODhMNDggODlMNDkgODlMNDkgOTBMNDggOTBMNDggOTFMNDkgOTFMNDkgOTJMNTAgOTJMNTAgOTNMNTQgOTNMNTQgOTJMNTMgOTJMNTMgOTBMNTIgOTBMNTIgOTFMNTEgOTFMNTEgOTJMNTAgOTJMNTAgOTFMNDkgOTFMNDkgOTBMNTEgOTBMNTEgODlMNTIgODlMNTIgODhMNTQgODhMNTQgOTBMNTYgOTBMNTYgOTJMNTUgOTJMNTUgOTNMNTYgOTNMNTYgOTJMNTcgOTJMNTcgOTNMNTkgOTNMNTkgOTJMNTggOTJMNTggOTBMNTkgOTBMNTkgOTFMNjAgOTFMNjAgOTBMNjEgOTBMNjEgODlMNjIgODlMNjIgOTBMNjMgOTBMNjMgOTFMNjQgOTFMNjQgOTJMNjYgOTJMNjYgOTNMNzEgOTNMNzEgOTJMNzAgOTJMNzAgOTFMNzIgOTFMNzIgOTNMNzUgOTNMNzUgOTFMNzQgOTFMNzQgOTBMNzYgOTBMNzYgOTFMNzcgOTFMNzcgOTNMNzggOTNMNzggOTJMNzkgOTJMNzkgOTNMODAgOTNMODAgOTJMODMgOTJMODMgOTNMODcgOTNMODcgOTJMODggOTJMODggOTNMODkgOTNMODkgOTJMODggOTJMODggOTFMODkgOTFMODkgOTBMODggOTBMODggOTFMODcgOTFMODcgODlMODkgODlMODkgODRMOTAgODRMOTAgODJMOTEgODJMOTEgODRMOTIgODRMOTIgODVMOTAgODVMOTAgODZMOTEgODZMOTEgODlMOTAgODlMOTAgOTFMOTEgOTFMOTEgOTBMOTMgOTBMOTMgODlMOTIgODlMOTIgODZMOTMgODZMOTMgODRMOTIgODRMOTIgODJMOTEgODJMOTEgODFMODkgODFMODkgNzlMOTEgNzlMOTEgNzdMOTIgNzdMOTIgNzVMOTEgNzVMOTEgNzRMODggNzRMODggNzNMODkgNzNMODkgNzJMODggNzJMODggNzNMODcgNzNMODcgNzJMODQgNzJMODQgNzBMODcgNzBMODcgNzFMODggNzFMODggNzBMODcgNzBMODcgNjhMODggNjhMODggNjlMODkgNjlMODkgNzFMOTAgNzFMOTAgNzBMOTEgNzBMOTEgNzFMOTIgNzFMOTIgNzBMOTMgNzBMOTMgNjhMOTIgNjhMOTIgNjdMOTEgNjdMOTEgNjZMOTIgNjZMOTIgNjVMOTMgNjVMOTMgNjRMOTIgNjRMOTIgNjVMOTEgNjVMOTEgNjRMOTAgNjRMOTAgNjdMODkgNjdMODkgNjZMODcgNjZMODcgNjhMODYgNjhMODYgNjlMODMgNjlMODMgNzJMODQgNzJMODQgNzNMODIgNzNMODIgNzRMODMgNzRMODMgNzVMNzcgNzVMNzcgNzRMNzUgNzRMNzUgNzJMNzYgNzJMNzYgNzFMNzcgNzFMNzcgNzBMNzYgNzBMNzYgNjlMNzcgNjlMNzcgNjhMNzggNjhMNzggNjlMNzkgNjlMNzkgNjhMNzggNjhMNzggNjdMNzcgNjdMNzcgNjhMNzYgNjhMNzYgNjlMNzUgNjlMNzUgNzBMNzQgNzBMNzQgNjhMNzMgNjhMNzMgNjdMNzYgNjdMNzYgNjZMNzcgNjZMNzcgNjVMNzYgNjVMNzYgNjZMNzUgNjZMNzUgNjVMNzQgNjVMNzQgNjRMNzMgNjRMNzMgNjNMNzIgNjNMNzIgNjJMNzQgNjJMNzQgNjNMNzUgNjNMNzUgNjJMNzcgNjJMNzcgNjBMNzYgNjBMNzYgNjFMNzUgNjFMNzUgNjBMNzMgNjBMNzMgNTlMNzIgNTlMNzIgNThMNzEgNThMNzEgNTlMNjkgNTlMNjkgNThMNjggNThMNjggNTdMNzEgNTdMNzEgNTVMNzIgNTVMNzIgNTZMNzMgNTZMNzMgNThMNzQgNThMNzQgNTdMNzUgNTdMNzUgNTZMNzMgNTZMNzMgNTVMNzUgNTVMNzUgNTRMNzYgNTRMNzYgNTZMNzcgNTZMNzcgNTdMNzggNTdMNzggNThMNzkgNThMNzkgNTlMNzggNTlMNzggNjBMNzkgNjBMNzkgNjNMNzggNjNMNzggNjZMODAgNjZMODAgNjRMODIgNjRMODIgNjNMODAgNjNMODAgNTlMODEgNTlMODEgNjBMODMgNjBMODMgNTlMODEgNTlMODEgNThMODAgNThMODAgNTZMODIgNTZMODIgNTdMODMgNTdMODMgNThMODQgNThMODQgNjFMODUgNjFMODUgNjJMODYgNjJMODYgNjFMOTAgNjFMOTAgNTlMOTEgNTlMOTEgNjBMOTIgNjBMOTIgNjFMOTMgNjFMOTMgNTlMOTIgNTlMOTIgNThMOTMgNThMOTMgNTVMOTEgNTVMOTEgNTdMOTAgNTdMOTAgNTRMOTMgNTRMOTMgNTFMOTIgNTFMOTIgNTJMOTEgNTJMOTEgNTNMOTAgNTNMOTAgNTFMODkgNTFMODkgNTBMOTAgNTBMOTAgNDhMODkgNDhMODkgNDdMOTEgNDdMOTEgNDlMOTMgNDlMOTMgNDhMOTIgNDhMOTIgNDZMOTAgNDZMOTAgNDVMODggNDVMODggNDZMODcgNDZMODcgNDRMODggNDRMODggNDNMODkgNDNMODkgNDRMOTAgNDRMOTAgNDNMOTEgNDNMOTEgNDJMOTMgNDJMOTMgNDFMOTIgNDFMOTIgMzhMOTEgMzhMOTEgMzdMOTMgMzdMOTMgMzZMOTEgMzZMOTEgMzdMODkgMzdMODkgMzhMODcgMzhMODcgNDFMODYgNDFMODYgNDJMODUgNDJMODUgNDBMODYgNDBMODYgMzdMODUgMzdMODUgMzZMODQgMzZMODQgMzVMODYgMzVMODYgMzRMODUgMzRMODUgMzNMODkgMzNMODkgMzRMODcgMzRMODcgMzVMODggMzVMODggMzZMODcgMzZMODcgMzdMODggMzdMODggMzZMOTAgMzZMOTAgMzRMOTEgMzRMOTEgMzNMOTAgMzNMOTAgMzBMOTEgMzBMOTEgMzJMOTIgMzJMOTIgMzNMOTMgMzNMOTMgMzFMOTIgMzFMOTIgMjlMOTMgMjlMOTMgMjhMOTIgMjhMOTIgMjVMOTMgMjVMOTMgMjNMOTEgMjNMOTEgMjJMOTMgMjJMOTMgMjBMOTEgMjBMOTEgMjJMOTAgMjJMOTAgMjFMODkgMjFMODkgMjBMOTAgMjBMOTAgMTlMOTIgMTlMOTIgMThMOTMgMThMOTMgMTVMOTIgMTVMOTIgMTNMOTMgMTNMOTMgMTFMOTIgMTFMOTIgOEw5MSA4TDkxIDEwTDkwIDEwTDkwIDlMODggOUw4OCA4TDg2IDhMODYgMTBMODMgMTBMODMgMTFMODIgMTFMODIgMTBMODEgMTBMODEgOUw4MiA5TDgyIDhMODQgOEw4NCA5TDg1IDlMODUgOEw4NCA4TDg0IDdMODUgN0w4NSA2TDg0IDZMODQgM0w4NSAzTDg1IDFMODQgMUw4NCAwTDgzIDBMODMgMkw4NCAyTDg0IDNMODMgM0w4MyA0TDgyIDRMODIgM0w4MSAzTDgxIDJMODIgMkw4MiAxTDgwIDFMODAgMEw3OCAwTDc4IDFMNzcgMUw3NyAwTDcxIDBMNzEgMkw3MCAyTDcwIDFMNjkgMUw2OSAwTDY3IDBMNjcgM0w2OCAzTDY4IDRMNzAgNEw3MCA1TDY4IDVMNjggN0w2NyA3TDY3IDRMNjYgNEw2NiAxTDY1IDFMNjUgM0w2NCAzTDY0IDJMNjMgMkw2MyAxTDY0IDFMNjQgMEw2MSAwTDYxIDFMNjIgMUw2MiA0TDYxIDRMNjEgMkw1OSAyTDU5IDFMNjAgMUw2MCAwTDU5IDBMNTkgMUw1OCAxTDU4IDBMNTcgMEw1NyAyTDU2IDJMNTYgMEw1NCAwTDU0IDFMNTMgMUw1MyAwTDUyIDBMNTIgMUw1MyAxTDUzIDJMNTQgMkw1NCAzTDUzIDNMNTMgNEw1MiA0TDUyIDJMNTEgMkw1MSAxTDUwIDFMNTAgMEw0OSAwTDQ5IDJMNDggMkw0OCAzTDUwIDNMNTAgMkw1MSAyTDUxIDRMNTIgNEw1MiA3TDUxIDdMNTEgNkw1MCA2TDUwIDRMNDcgNEw0NyA1TDQ5IDVMNDkgNkw0OCA2TDQ4IDdMNDcgN0w0NyA2TDQ2IDZMNDYgN0w0NyA3TDQ3IDlMNDYgOUw0NiAxMEw0NyAxMEw0NyAxMUw0NiAxMUw0NiAxMkw0NSAxMkw0NSAxMUw0NCAxMUw0NCAxMEw0NSAxMEw0NSA2TDQ0IDZMNDQgNUw0NiA1TDQ2IDRMNDUgNEw0NSAzTDQ2IDNMNDYgMUw0OCAxTDQ4IDBMNDUgMEw0NSAxTDQ0IDFMNDQgMkw0MiAyTDQyIDBMNDAgMEw0MCAxTDM5IDFMMzkgMEwzNiAwTDM2IDFMMzUgMUwzNSAyTDM3IDJMMzcgM0wzNiAzTDM2IDRMMzcgNEwzNyAzTDM5IDNMMzkgMkw0MSAyTDQxIDRMMzggNEwzOCA1TDM5IDVMMzkgNkwzOCA2TDM4IDdMMzkgN0wzOSA4TDM3IDhMMzcgOUwzNiA5TDM2IDEwTDM1IDEwTDM1IDExTDMyIDExTDMyIDEyTDMxIDEyTDMxIDEzTDMyIDEzTDMyIDE0TDMwIDE0TDMwIDE1TDMxIDE1TDMxIDE2TDMzIDE2TDMzIDE1TDM0IDE1TDM0IDE0TDM4IDE0TDM4IDEzTDM5IDEzTDM5IDE0TDQyIDE0TDQyIDE1TDQxIDE1TDQxIDE2TDQyIDE2TDQyIDE3TDQxIDE3TDQxIDE4TDQwIDE4TDQwIDE2TDM5IDE2TDM5IDE1TDM3IDE1TDM3IDE2TDM4IDE2TDM4IDE3TDM5IDE3TDM5IDE4TDQwIDE4TDQwIDE5TDM4IDE5TDM4IDE4TDM3IDE4TDM3IDE3TDM2IDE3TDM2IDE4TDM3IDE4TDM3IDIwTDM2IDIwTDM2IDE5TDMxIDE5TDMxIDIwTDMwIDIwTDMwIDE4TDMxIDE4TDMxIDE3TDMwIDE3TDMwIDE2TDI4IDE2TDI4IDE1TDI5IDE1TDI5IDE0TDI4IDE0TDI4IDEzTDMwIDEzTDMwIDEyTDI5IDEyTDI5IDExTDI3IDExTDI3IDEwTDI1IDEwTDI1IDExTDI2IDExTDI2IDEyTDI4IDEyTDI4IDEzTDI3IDEzTDI3IDE0TDI0IDE0TDI0IDEyTDIzIDEyTDIzIDExTDE5IDExTDE5IDEwTDE4IDEwTDE4IDdMMTkgN0wxOSA4TDIwIDhMMjAgOUwyMiA5TDIyIDEwTDIzIDEwTDIzIDlMMjYgOUwyNiA4TDIzIDhMMjMgNUwyMCA1TDIwIDdMMTkgN0wxOSA2TDE4IDZMMTggM0wxOSAzTDE5IDRMMjAgNEwyMCAzTDIyIDNMMjIgMkwyMCAyTDIwIDFMMjEgMUwyMSAwTDIwIDBMMjAgMUwxNiAxTDE2IDBaTTI2IDBMMjYgMUwyNyAxTDI3IDJMMjggMkwyOCAzTDI2IDNMMjYgMkwyNSAyTDI1IDFMMjMgMUwyMyAyTDI1IDJMMjUgNEwyNiA0TDI2IDdMMjcgN0wyNyA5TDI4IDlMMjggMTBMMjkgMTBMMjkgOUwzMCA5TDMwIDExTDMxIDExTDMxIDlMMzUgOUwzNSA4TDM2IDhMMzYgN0wzNyA3TDM3IDZMMzYgNkwzNiA3TDM1IDdMMzUgNkwzNCA2TDM0IDhMMzMgOEwzMyA1TDM1IDVMMzUgNEwzNCA0TDM0IDNMMzMgM0wzMyAyTDM0IDJMMzQgMUwzMyAxTDMzIDBMMzEgMEwzMSAxTDMwIDFMMzAgMEwyOCAwTDI4IDFMMjcgMUwyNyAwWk0xNCAxTDE0IDJMMTMgMkwxMyA0TDExIDRMMTEgNUwxMiA1TDEyIDZMMTEgNkwxMSA3TDEyIDdMMTIgOEwxMCA4TDEwIDExTDEzIDExTDEzIDEyTDExIDEyTDExIDEzTDEwIDEzTDEwIDE1TDkgMTVMOSAxNkwxMCAxNkwxMCAxOEw3IDE4TDcgMTdMOCAxN0w4IDE2TDcgMTZMNyAxN0w1IDE3TDUgMThMNCAxOEw0IDE5TDUgMTlMNSAyMEwzIDIwTDMgMjFMMiAyMUwyIDIzTDUgMjNMNSAyNkw3IDI2TDcgMjdMNSAyN0w1IDI4TDcgMjhMNyAyN0w5IDI3TDkgMjlMMTEgMjlMMTEgMzFMMTAgMzFMMTAgMzJMMTEgMzJMMTEgMzNMMTAgMzNMMTAgMzRMOSAzNEw5IDM2TDExIDM2TDExIDM3TDEyIDM3TDEyIDM4TDExIDM4TDExIDM5TDEwIDM5TDEwIDM3TDkgMzdMOSAzOUw4IDM5TDggNDBMMTAgNDBMMTAgNDFMMTEgNDFMMTEgNDBMMTIgNDBMMTIgNDJMMTEgNDJMMTEgNDVMMTAgNDVMMTAgNDZMNyA0Nkw3IDQ1TDkgNDVMOSA0NEw4IDQ0TDggNDNMOSA0M0w5IDQyTDggNDJMOCA0M0w1IDQzTDUgNDJMNCA0Mkw0IDQzTDUgNDNMNSA0NUw0IDQ1TDQgNDZMMyA0NkwzIDQ3TDIgNDdMMiA0OEwzIDQ4TDMgNDdMNCA0N0w0IDQ4TDUgNDhMNSA0OUw2IDQ5TDYgNTBMNyA1MEw3IDUxTDYgNTFMNiA1Mkw5IDUyTDkgNTNMOCA1M0w4IDU0TDcgNTRMNyA1M0w2IDUzTDYgNTRMNSA1NEw1IDU1TDQgNTVMNCA1Nkw1IDU2TDUgNTVMNiA1NUw2IDU2TDcgNTZMNyA1NUw4IDU1TDggNTRMMTAgNTRMMTAgNTNMMTEgNTNMMTEgNTVMMTAgNTVMMTAgNTZMOSA1Nkw5IDU3TDEwIDU3TDEwIDU5TDkgNTlMOSA2MUw2IDYxTDYgNjJMNyA2Mkw3IDYzTDYgNjNMNiA2NEw1IDY0TDUgNjNMNCA2M0w0IDY0TDUgNjRMNSA2NUwzIDY1TDMgNjZMNCA2Nkw0IDY4TDcgNjhMNyA2N0w4IDY3TDggNjhMOSA2OEw5IDY5TDggNjlMOCA3Mkw3IDcyTDcgNzFMNiA3MUw2IDcyTDUgNzJMNSA3Nkw3IDc2TDcgNzdMNiA3N0w2IDc4TDcgNzhMNyA3N0w4IDc3TDggNzZMNyA3Nkw3IDc1TDYgNzVMNiA3NEw5IDc0TDkgNzNMMTAgNzNMMTAgNzVMOSA3NUw5IDc2TDExIDc2TDExIDc4TDEwIDc4TDEwIDc3TDkgNzdMOSA4MEw4IDgwTDggODFMNSA4MUw1IDgzTDYgODNMNiA4NEw3IDg0TDcgODNMNiA4M0w2IDgyTDggODJMOCA4NEw5IDg0TDkgODhMMTEgODhMMTEgODlMMTIgODlMMTIgODhMMTMgODhMMTMgODlMMTUgODlMMTUgODhMMTMgODhMMTMgODdMMTQgODdMMTQgODNMMTMgODNMMTMgODJMMTIgODJMMTIgODNMMTMgODNMMTMgODdMMTIgODdMMTIgODZMMTAgODZMMTAgODVMMTIgODVMMTIgODRMMTEgODRMMTEgODJMMTAgODJMMTAgODFMOSA4MUw5IDgwTDEwIDgwTDEwIDc5TDExIDc5TDExIDgxTDEyIDgxTDEyIDgwTDE1IDgwTDE1IDc5TDE2IDc5TDE2IDc4TDE1IDc4TDE1IDc5TDEzIDc5TDEzIDc3TDE0IDc3TDE0IDc2TDExIDc2TDExIDc1TDEzIDc1TDEzIDc0TDE0IDc0TDE0IDc1TDE1IDc1TDE1IDc2TDE2IDc2TDE2IDc3TDE3IDc3TDE3IDc4TDE4IDc4TDE4IDgwTDE2IDgwTDE2IDgxTDE1IDgxTDE1IDgyTDE2IDgyTDE2IDgzTDE1IDgzTDE1IDg1TDE2IDg1TDE2IDg2TDE1IDg2TDE1IDg3TDE4IDg3TDE4IDg4TDE5IDg4TDE5IDg5TDE4IDg5TDE4IDkwTDE5IDkwTDE5IDg5TDIwIDg5TDIwIDkwTDIxIDkwTDIxIDg5TDIwIDg5TDIwIDg4TDIxIDg4TDIxIDg3TDIwIDg3TDIwIDg2TDE5IDg2TDE5IDg3TDE4IDg3TDE4IDg2TDE3IDg2TDE3IDg1TDE4IDg1TDE4IDg0TDE3IDg0TDE3IDgzTDE4IDgzTDE4IDgyTDE3IDgyTDE3IDgxTDE5IDgxTDE5IDgwTDIwIDgwTDIwIDgxTDIxIDgxTDIxIDgwTDIwIDgwTDIwIDc3TDIxIDc3TDIxIDc4TDIyIDc4TDIyIDc5TDI1IDc5TDI1IDgwTDIyIDgwTDIyIDgzTDIwIDgzTDIwIDgyTDE5IDgyTDE5IDg0TDIwIDg0TDIwIDg1TDIxIDg1TDIxIDg2TDIzIDg2TDIzIDg1TDI3IDg1TDI3IDg4TDI2IDg4TDI2IDg2TDI1IDg2TDI1IDg4TDI2IDg4TDI2IDg5TDI1IDg5TDI1IDkwTDI4IDkwTDI4IDg5TDI3IDg5TDI3IDg4TDI4IDg4TDI4IDg1TDI3IDg1TDI3IDgzTDI2IDgzTDI2IDgyTDI1IDgyTDI1IDgxTDI4IDgxTDI4IDgwTDI3IDgwTDI3IDc5TDI2IDc5TDI2IDc3TDI3IDc3TDI3IDc2TDI4IDc2TDI4IDc1TDI5IDc1TDI5IDc3TDMxIDc3TDMxIDc4TDMyIDc4TDMyIDc3TDMzIDc3TDMzIDgwTDM0IDgwTDM0IDgyTDM1IDgyTDM1IDgzTDM2IDgzTDM2IDg0TDM1IDg0TDM1IDg1TDM2IDg1TDM2IDg2TDM1IDg2TDM1IDg3TDM3IDg3TDM3IDg2TDM4IDg2TDM4IDg3TDM5IDg3TDM5IDg4TDM4IDg4TDM4IDg5TDM5IDg5TDM5IDg4TDQwIDg4TDQwIDg3TDM5IDg3TDM5IDg2TDM4IDg2TDM4IDg1TDM2IDg1TDM2IDg0TDM3IDg0TDM3IDgzTDM5IDgzTDM5IDg0TDQwIDg0TDQwIDg1TDQxIDg1TDQxIDg3TDQzIDg3TDQzIDg1TDQ1IDg1TDQ1IDg2TDQ2IDg2TDQ2IDg1TDQ3IDg1TDQ3IDg0TDQ4IDg0TDQ4IDg1TDQ5IDg1TDQ5IDg0TDUwIDg0TDUwIDgzTDQ5IDgzTDQ5IDgyTDUwIDgyTDUwIDgxTDUzIDgxTDUzIDgyTDUxIDgyTDUxIDgzTDUyIDgzTDUyIDg1TDUxIDg1TDUxIDg2TDUwIDg2TDUwIDg3TDQ5IDg3TDQ5IDg4TDUwIDg4TDUwIDg5TDUxIDg5TDUxIDg4TDUyIDg4TDUyIDg3TDUxIDg3TDUxIDg2TDUyIDg2TDUyIDg1TDUzIDg1TDUzIDg2TDU0IDg2TDU0IDg4TDU1IDg4TDU1IDg5TDU2IDg5TDU2IDg1TDU1IDg1TDU1IDg0TDU0IDg0TDU0IDg1TDUzIDg1TDUzIDgyTDU0IDgyTDU0IDgzTDU2IDgzTDU2IDgxTDU3IDgxTDU3IDc5TDU2IDc5TDU2IDc4TDU4IDc4TDU4IDgxTDU5IDgxTDU5IDgyTDU3IDgyTDU3IDg0TDU5IDg0TDU5IDgyTDYwIDgyTDYwIDg0TDYxIDg0TDYxIDg1TDYyIDg1TDYyIDg2TDYxIDg2TDYxIDg4TDYyIDg4TDYyIDg2TDYzIDg2TDYzIDg5TDY0IDg5TDY0IDkxTDY2IDkxTDY2IDkyTDY3IDkyTDY3IDkxTDY4IDkxTDY4IDkyTDY5IDkyTDY5IDkxTDcwIDkxTDcwIDg3TDcxIDg3TDcxIDkwTDcyIDkwTDcyIDkxTDczIDkxTDczIDg4TDc0IDg4TDc0IDg3TDc1IDg3TDc1IDg5TDc2IDg5TDc2IDg3TDc1IDg3TDc1IDg2TDc3IDg2TDc3IDg4TDc4IDg4TDc4IDg5TDc3IDg5TDc3IDkxTDc5IDkxTDc5IDkwTDc4IDkwTDc4IDg5TDc5IDg5TDc5IDg3TDc4IDg3TDc4IDg2TDgwIDg2TDgwIDg1TDc4IDg1TDc4IDg0TDc3IDg0TDc3IDgzTDc5IDgzTDc5IDg0TDgwIDg0TDgwIDgzTDgzIDgzTDgzIDg0TDgyIDg0TDgyIDg1TDgxIDg1TDgxIDg3TDgwIDg3TDgwIDg4TDgxIDg4TDgxIDg3TDgyIDg3TDgyIDg5TDgxIDg5TDgxIDkwTDgwIDkwTDgwIDkxTDgzIDkxTDgzIDkyTDg3IDkyTDg3IDkxTDg0IDkxTDg0IDkwTDg2IDkwTDg2IDg5TDg0IDg5TDg0IDgzTDg1IDgzTDg1IDgxTDg3IDgxTDg3IDgwTDg2IDgwTDg2IDc5TDg1IDc5TDg1IDgxTDg0IDgxTDg0IDgwTDgwIDgwTDgwIDgxTDc5IDgxTDc5IDgyTDc4IDgyTDc4IDgwTDc5IDgwTDc5IDc5TDgwIDc5TDgwIDc3TDc5IDc3TDc5IDc5TDc4IDc5TDc4IDc3TDc3IDc3TDc3IDc1TDc2IDc1TDc2IDc2TDc0IDc2TDc0IDc0TDcyIDc0TDcyIDczTDczIDczTDczIDcyTDc0IDcyTDc0IDcxTDczIDcxTDczIDY4TDcyIDY4TDcyIDY3TDY5IDY3TDY5IDY2TDcwIDY2TDcwIDY1TDcxIDY1TDcxIDY2TDczIDY2TDczIDY0TDcyIDY0TDcyIDYzTDcxIDYzTDcxIDY0TDY5IDY0TDY5IDYzTDY4IDYzTDY4IDY0TDY5IDY0TDY5IDY2TDY3IDY2TDY3IDY1TDY2IDY1TDY2IDY0TDY3IDY0TDY3IDYzTDY1IDYzTDY1IDYyTDY2IDYyTDY2IDYwTDY3IDYwTDY3IDU5TDY4IDU5TDY4IDU4TDY3IDU4TDY3IDU1TDY2IDU1TDY2IDUzTDY3IDUzTDY3IDU0TDY4IDU0TDY4IDU1TDcwIDU1TDcwIDU0TDcyIDU0TDcyIDU1TDczIDU1TDczIDUyTDcyIDUyTDcyIDUxTDc1IDUxTDc1IDUwTDc3IDUwTDc3IDUxTDc2IDUxTDc2IDUzTDc3IDUzTDc3IDU0TDc4IDU0TDc4IDUzTDc3IDUzTDc3IDUyTDgwIDUyTDgwIDUxTDgyIDUxTDgyIDUzTDgxIDUzTDgxIDU0TDgwIDU0TDgwIDUzTDc5IDUzTDc5IDU0TDgwIDU0TDgwIDU1TDgyIDU1TDgyIDU2TDg1IDU2TDg1IDU1TDg2IDU1TDg2IDU2TDg5IDU2TDg5IDU1TDg2IDU1TDg2IDU0TDg3IDU0TDg3IDUzTDg4IDUzTDg4IDU0TDg5IDU0TDg5IDUyTDg4IDUyTDg4IDUxTDg2IDUxTDg2IDUwTDg1IDUwTDg1IDQ5TDg3IDQ5TDg3IDUwTDg5IDUwTDg5IDQ4TDg4IDQ4TDg4IDQ5TDg3IDQ5TDg3IDQ2TDg2IDQ2TDg2IDQ4TDg1IDQ4TDg1IDQ3TDg0IDQ3TDg0IDQ4TDgzIDQ4TDgzIDQ3TDgyIDQ3TDgyIDQ2TDg0IDQ2TDg0IDQ1TDgzIDQ1TDgzIDQ0TDg3IDQ0TDg3IDQyTDkxIDQyTDkxIDM4TDg5IDM4TDg5IDM5TDkwIDM5TDkwIDQxTDg5IDQxTDg5IDQwTDg4IDQwTDg4IDQxTDg3IDQxTDg3IDQyTDg2IDQyTDg2IDQzTDg0IDQzTDg0IDQyTDgzIDQyTDgzIDQxTDg0IDQxTDg0IDQwTDg1IDQwTDg1IDM5TDgzIDM5TDgzIDM4TDg0IDM4TDg0IDM3TDgzIDM3TDgzIDM2TDgxIDM2TDgxIDM1TDgwIDM1TDgwIDMzTDc4IDMzTDc4IDMyTDc3IDMyTDc3IDMxTDgzIDMxTDgzIDMyTDgxIDMyTDgxIDM0TDgyIDM0TDgyIDMzTDgzIDMzTDgzIDM1TDg0IDM1TDg0IDMzTDgzIDMzTDgzIDMyTDg0IDMyTDg0IDMxTDgzIDMxTDgzIDMwTDgyIDMwTDgyIDI5TDgzIDI5TDgzIDI4TDg1IDI4TDg1IDI2TDg2IDI2TDg2IDI3TDg3IDI3TDg3IDI4TDg4IDI4TDg4IDI2TDg5IDI2TDg5IDI5TDkwIDI5TDkwIDI4TDkxIDI4TDkxIDI2TDkwIDI2TDkwIDIzTDg5IDIzTDg5IDIxTDg4IDIxTDg4IDIwTDg3IDIwTDg3IDIxTDg2IDIxTDg2IDIwTDg0IDIwTDg0IDE5TDg5IDE5TDg5IDE4TDkxIDE4TDkxIDE2TDkyIDE2TDkyIDE1TDkwIDE1TDkwIDE3TDg5IDE3TDg5IDE2TDg4IDE2TDg4IDE3TDg3IDE3TDg3IDE4TDg2IDE4TDg2IDE2TDg3IDE2TDg3IDE1TDg5IDE1TDg5IDEzTDkwIDEzTDkwIDE0TDkxIDE0TDkxIDEzTDkyIDEzTDkyIDExTDkwIDExTDkwIDEwTDg5IDEwTDg5IDEzTDg4IDEzTDg4IDEyTDg3IDEyTDg3IDEzTDg4IDEzTDg4IDE0TDg2IDE0TDg2IDEzTDg1IDEzTDg1IDEyTDg2IDEyTDg2IDExTDg3IDExTDg3IDEwTDg2IDEwTDg2IDExTDg0IDExTDg0IDEzTDgyIDEzTDgyIDExTDgxIDExTDgxIDEwTDgwIDEwTDgwIDlMNzkgOUw3OSA4TDgwIDhMODAgNkw4MSA2TDgxIDhMODIgOEw4MiA2TDgzIDZMODMgN0w4NCA3TDg0IDZMODMgNkw4MyA1TDgyIDVMODIgNkw4MSA2TDgxIDNMNzkgM0w3OSAxTDc4IDFMNzggMkw3NyAyTDc3IDNMNzggM0w3OCA0TDc2IDRMNzYgNUw3NSA1TDc1IDdMNzQgN0w3NCA1TDczIDVMNzMgM0w3MiAzTDcyIDRMNzEgNEw3MSA1TDcwIDVMNzAgNkw2OSA2TDY5IDdMNjggN0w2OCA5TDY1IDlMNjUgN0w2NiA3TDY2IDZMNjUgNkw2NSA1TDY2IDVMNjYgNEw2NSA0TDY1IDVMNjQgNUw2NCA2TDYzIDZMNjMgNUw2MSA1TDYxIDlMNjIgOUw2MiA4TDYzIDhMNjMgN0w2NCA3TDY0IDlMNjUgOUw2NSAxMUw2NCAxMUw2NCAxMEw2MiAxMEw2MiAxMUw2MSAxMUw2MSAxMEw2MCAxMEw2MCAxMUw1OSAxMUw1OSA5TDU3IDlMNTcgMTBMNTYgMTBMNTYgOEw1NSA4TDU1IDlMNTQgOUw1NCA2TDU1IDZMNTUgN0w1NiA3TDU2IDRMNTUgNEw1NSA1TDU0IDVMNTQgNEw1MyA0TDUzIDVMNTQgNUw1NCA2TDUzIDZMNTMgMTFMNTIgMTFMNTIgMTBMNTEgMTBMNTEgN0w1MCA3TDUwIDZMNDkgNkw0OSA4TDQ4IDhMNDggOUw0OSA5TDQ5IDExTDQ3IDExTDQ3IDEyTDQ2IDEyTDQ2IDEzTDQ3IDEzTDQ3IDEyTDQ4IDEyTDQ4IDE0TDQ2IDE0TDQ2IDE1TDQ4IDE1TDQ4IDE2TDQ1IDE2TDQ1IDE1TDQ0IDE1TDQ0IDE2TDQzIDE2TDQzIDE1TDQyIDE1TDQyIDE2TDQzIDE2TDQzIDE3TDQyIDE3TDQyIDE4TDQzIDE4TDQzIDIwTDQ1IDIwTDQ1IDIxTDQ0IDIxTDQ0IDIzTDQzIDIzTDQzIDIyTDQyIDIyTDQyIDIxTDQxIDIxTDQxIDE5TDQwIDE5TDQwIDIxTDQxIDIxTDQxIDIyTDQwIDIyTDQwIDIzTDQxIDIzTDQxIDI0TDQzIDI0TDQzIDI2TDQyIDI2TDQyIDI1TDM5IDI1TDM5IDIxTDM4IDIxTDM4IDIyTDM2IDIyTDM2IDI0TDM1IDI0TDM1IDI1TDM0IDI1TDM0IDIxTDMzIDIxTDMzIDIwTDMxIDIwTDMxIDIyTDMzIDIyTDMzIDI1TDMwIDI1TDMwIDI2TDMxIDI2TDMxIDI3TDMwIDI3TDMwIDI4TDMxIDI4TDMxIDI3TDM0IDI3TDM0IDI4TDMzIDI4TDMzIDMxTDM0IDMxTDM0IDI4TDM1IDI4TDM1IDI3TDM0IDI3TDM0IDI2TDM3IDI2TDM3IDI4TDM4IDI4TDM4IDI2TDM5IDI2TDM5IDI3TDQxIDI3TDQxIDI4TDM5IDI4TDM5IDMwTDM4IDMwTDM4IDMxTDM1IDMxTDM1IDMyTDM3IDMyTDM3IDM0TDM4IDM0TDM4IDM2TDM3IDM2TDM3IDM3TDM4IDM3TDM4IDQyTDM5IDQyTDM5IDQzTDQwIDQzTDQwIDQ0TDQxIDQ0TDQxIDQzTDQzIDQzTDQzIDQ0TDQyIDQ0TDQyIDQ1TDQxIDQ1TDQxIDQ2TDQyIDQ2TDQyIDQ4TDQxIDQ4TDQxIDQ5TDQzIDQ5TDQzIDQ4TDQ0IDQ4TDQ0IDQ3TDQ1IDQ3TDQ1IDQ2TDQ2IDQ2TDQ2IDQ1TDQ3IDQ1TDQ3IDQ3TDQ2IDQ3TDQ2IDQ5TDQ0IDQ5TDQ0IDUwTDM5IDUwTDM5IDUxTDQxIDUxTDQxIDUyTDQwIDUyTDQwIDUzTDM5IDUzTDM5IDUyTDM4IDUyTDM4IDU0TDM3IDU0TDM3IDUzTDM2IDUzTDM2IDU1TDM0IDU1TDM0IDU0TDMyIDU0TDMyIDUzTDMzIDUzTDMzIDUyTDM3IDUyTDM3IDUxTDM4IDUxTDM4IDQ5TDM5IDQ5TDM5IDQ4TDQwIDQ4TDQwIDQ2TDM5IDQ2TDM5IDQ4TDM4IDQ4TDM4IDQ5TDM3IDQ5TDM3IDUwTDM2IDUwTDM2IDQ5TDM1IDQ5TDM1IDQ4TDM3IDQ4TDM3IDQ3TDM4IDQ3TDM4IDQ2TDM3IDQ2TDM3IDQ1TDM5IDQ1TDM5IDQ0TDM3IDQ0TDM3IDQyTDM1IDQyTDM1IDQxTDM0IDQxTDM0IDQzTDM1IDQzTDM1IDQ0TDMzIDQ0TDMzIDM5TDM0IDM5TDM0IDM4TDMzIDM4TDMzIDM5TDMyIDM5TDMyIDM4TDMxIDM4TDMxIDM3TDMwIDM3TDMwIDM4TDI5IDM4TDI5IDM3TDI4IDM3TDI4IDM4TDI5IDM4TDI5IDQwTDMwIDQwTDMwIDM4TDMxIDM4TDMxIDQwTDMyIDQwTDMyIDQxTDI4IDQxTDI4IDQyTDI3IDQyTDI3IDQxTDI1IDQxTDI1IDQwTDI0IDQwTDI0IDM5TDIzIDM5TDIzIDQxTDIxIDQxTDIxIDQwTDE5IDQwTDE5IDM5TDIyIDM5TDIyIDM3TDIxIDM3TDIxIDM4TDIwIDM4TDIwIDM2TDI2IDM2TDI2IDM0TDI4IDM0TDI4IDM1TDI3IDM1TDI3IDM2TDI5IDM2TDI5IDM0TDI4IDM0TDI4IDMzTDI2IDMzTDI2IDM0TDI1IDM0TDI1IDMyTDI0IDMyTDI0IDMxTDIzIDMxTDIzIDI5TDI0IDI5TDI0IDMwTDI1IDMwTDI1IDI5TDI2IDI5TDI2IDI4TDI0IDI4TDI0IDI3TDIzIDI3TDIzIDI2TDIyIDI2TDIyIDI1TDIxIDI1TDIxIDI0TDIwIDI0TDIwIDIzTDIxIDIzTDIxIDIyTDIyIDIyTDIyIDIzTDIzIDIzTDIzIDI1TDI1IDI1TDI1IDI3TDI3IDI3TDI3IDI2TDI4IDI2TDI4IDI3TDI5IDI3TDI5IDI1TDI3IDI1TDI3IDI0TDI4IDI0TDI4IDIzTDI3IDIzTDI3IDIyTDMwIDIyTDMwIDIwTDI3IDIwTDI3IDE5TDI4IDE5TDI4IDE4TDI3IDE4TDI3IDE3TDI4IDE3TDI4IDE2TDI3IDE2TDI3IDE1TDI2IDE1TDI2IDE2TDI1IDE2TDI1IDE1TDI0IDE1TDI0IDE0TDIzIDE0TDIzIDE1TDIyIDE1TDIyIDEzTDIzIDEzTDIzIDEyTDIyIDEyTDIyIDEzTDIxIDEzTDIxIDE1TDIyIDE1TDIyIDE2TDIwIDE2TDIwIDE1TDE5IDE1TDE5IDE3TDE4IDE3TDE4IDE1TDE3IDE1TDE3IDE0TDE4IDE0TDE4IDEzTDE3IDEzTDE3IDExTDE2IDExTDE2IDEwTDE1IDEwTDE1IDExTDEzIDExTDEzIDEwTDE0IDEwTDE0IDlMMTYgOUwxNiA4TDE1IDhMMTUgN0wxNiA3TDE2IDZMMTcgNkwxNyA3TDE4IDdMMTggNkwxNyA2TDE3IDVMMTYgNUwxNiA0TDE1IDRMMTUgM0wxNCAzTDE0IDJMMTUgMkwxNSAxWk0zMSAxTDMxIDJMMzMgMkwzMyAxWk02OCAxTDY4IDJMNjkgMkw2OSAxWk03MiAxTDcyIDJMNzUgMkw3NSAzTDc0IDNMNzQgNEw3NSA0TDc1IDNMNzYgM0w3NiAyTDc1IDJMNzUgMVpNMTYgMkwxNiAzTDE4IDNMMTggMlpNMjkgMkwyOSAzTDI4IDNMMjggNEwyNyA0TDI3IDVMMjggNUwyOCA0TDMxIDRMMzEgM0wzMCAzTDMwIDJaTTQ0IDJMNDQgM0w0NSAzTDQ1IDJaTTU1IDJMNTUgM0w1NiAzTDU2IDJaTTU3IDJMNTcgM0w1OCAzTDU4IDRMNTkgNEw1OSAzTDU4IDNMNTggMlpNMzIgM0wzMiA0TDMzIDRMMzMgM1pNNjMgM0w2MyA0TDY0IDRMNjQgM1pNNDEgNEw0MSA3TDQyIDdMNDIgNUw0MyA1TDQzIDRaTTEzIDVMMTMgNkwxMiA2TDEyIDdMMTMgN0wxMyA2TDE0IDZMMTQgN0wxNSA3TDE1IDZMMTYgNkwxNiA1Wk0yNCA1TDI0IDdMMjUgN0wyNSA1Wk0yOSA1TDI5IDhMMzIgOEwzMiA1Wk01NyA1TDU3IDhMNjAgOEw2MCA1Wk03NyA1TDc3IDZMNzYgNkw3NiA3TDc3IDdMNzcgNkw3OCA2TDc4IDdMNzkgN0w3OSA2TDc4IDZMNzggNVpNMjEgNkwyMSA3TDIyIDdMMjIgNlpNMjcgNkwyNyA3TDI4IDdMMjggNlpNMzAgNkwzMCA3TDMxIDdMMzEgNlpNMzkgNkwzOSA3TDQwIDdMNDAgNlpNNDMgNkw0MyA3TDQ0IDdMNDQgNlpNNTggNkw1OCA3TDU5IDdMNTkgNlpNNjIgNkw2MiA3TDYzIDdMNjMgNlpNNjQgNkw2NCA3TDY1IDdMNjUgNlpNNzAgNkw3MCA3TDY5IDdMNjkgOEw3MCA4TDcwIDdMNzEgN0w3MSA2Wk03MiA2TDcyIDdMNzMgN0w3MyA2Wk04IDhMOCAxMEw5IDEwTDkgOFpNMTIgOEwxMiA5TDExIDlMMTEgMTBMMTIgMTBMMTIgOUwxMyA5TDEzIDhaTTIyIDhMMjIgOUwyMyA5TDIzIDhaTTM5IDhMMzkgMTBMMzggMTBMMzggOUwzNyA5TDM3IDEwTDM2IDEwTDM2IDEyTDMzIDEyTDMzIDEzTDM2IDEzTDM2IDEyTDM3IDEyTDM3IDEzTDM4IDEzTDM4IDEyTDQwIDEyTDQwIDEzTDQxIDEzTDQxIDEyTDQyIDEyTDQyIDExTDQzIDExTDQzIDEwTDQ0IDEwTDQ0IDlMNDMgOUw0MyAxMEw0MSAxMEw0MSA4Wk00OSA4TDQ5IDlMNTAgOUw1MCA4Wk03MiA4TDcyIDlMNzAgOUw3MCAxMEw3MSAxMEw3MSAxMUw3MiAxMUw3MiA5TDczIDlMNzMgMTFMNzYgMTFMNzYgMTJMNzcgMTJMNzcgMTNMNzggMTNMNzggMTRMNzkgMTRMNzkgMTZMNzggMTZMNzggMTVMNzcgMTVMNzcgMTRMNzYgMTRMNzYgMTNMNzUgMTNMNzUgMTJMNzMgMTJMNzMgMTRMNzQgMTRMNzQgMTVMNzUgMTVMNzUgMTRMNzYgMTRMNzYgMTVMNzcgMTVMNzcgMTZMNzggMTZMNzggMTdMODAgMTdMODAgMTlMNzkgMTlMNzkgMThMNzggMThMNzggMTlMNzcgMTlMNzcgMjBMNzYgMjBMNzYgMTlMNzUgMTlMNzUgMThMNzcgMThMNzcgMTdMNzQgMTdMNzQgMTZMNzMgMTZMNzMgMTVMNzIgMTVMNzIgMTRMNzEgMTRMNzEgMTJMNzAgMTJMNzAgMTVMNzIgMTVMNzIgMTdMNzAgMTdMNzAgMTlMNjggMTlMNjggMjFMNzAgMjFMNzAgMjBMNzEgMjBMNzEgMTlMNzIgMTlMNzIgMjBMNzYgMjBMNzYgMjJMNzcgMjJMNzcgMjFMODAgMjFMODAgMjNMNzkgMjNMNzkgMjJMNzggMjJMNzggMjRMNzcgMjRMNzcgMjNMNzYgMjNMNzYgMjVMNzggMjVMNzggMjRMNzkgMjRMNzkgMjZMNzggMjZMNzggMjdMNzcgMjdMNzcgMjZMNzQgMjZMNzQgMjVMNzUgMjVMNzUgMjRMNzMgMjRMNzMgMjNMNzUgMjNMNzUgMjFMNzMgMjFMNzMgMjJMNzAgMjJMNzAgMjNMNjggMjNMNjggMjJMNjcgMjJMNjcgMjNMNjUgMjNMNjUgMjFMNjQgMjFMNjQgMjJMNjMgMjJMNjMgMTlMNjUgMTlMNjUgMjBMNjYgMjBMNjYgMjFMNjcgMjFMNjcgMThMNjggMThMNjggMTdMNjkgMTdMNjkgMTZMNjggMTZMNjggMTVMNjcgMTVMNjcgMTRMNjUgMTRMNjUgMTJMNjQgMTJMNjQgMTRMNjMgMTRMNjMgMTFMNjIgMTFMNjIgMTJMNTkgMTJMNTkgMTFMNTggMTFMNTggMTBMNTcgMTBMNTcgMTFMNTggMTFMNTggMTJMNTcgMTJMNTcgMTNMNTYgMTNMNTYgMTRMNTUgMTRMNTUgMTVMNTYgMTVMNTYgMTZMNTcgMTZMNTcgMTVMNTggMTVMNTggMTZMNTkgMTZMNTkgMTVMNjAgMTVMNjAgMTZMNjEgMTZMNjEgMTlMNjAgMTlMNjAgMjBMNTkgMjBMNTkgMTlMNTcgMTlMNTcgMjBMNTYgMjBMNTYgMjFMNTcgMjFMNTcgMjJMNTggMjJMNTggMjRMNTkgMjRMNTkgMjVMNjAgMjVMNjAgMjRMNjEgMjRMNjEgMjdMNjMgMjdMNjMgMjhMNjQgMjhMNjQgMjdMNjUgMjdMNjUgMjlMNjYgMjlMNjYgMzBMNjggMzBMNjggMzFMNjcgMzFMNjcgMzRMNjYgMzRMNjYgMzVMNjUgMzVMNjUgMzJMNjYgMzJMNjYgMzFMNjQgMzFMNjQgMzNMNjMgMzNMNjMgMzBMNjQgMzBMNjQgMjlMNjMgMjlMNjMgMzBMNjIgMzBMNjIgMjhMNjAgMjhMNjAgMjZMNTkgMjZMNTkgMjhMNTggMjhMNTggMjZMNTcgMjZMNTcgMjdMNTYgMjdMNTYgMjVMNTQgMjVMNTQgMjRMNTMgMjRMNTMgMjFMNTEgMjFMNTEgMjBMNTQgMjBMNTQgMjFMNTUgMjFMNTUgMThMNTkgMThMNTkgMTdMNTUgMTdMNTUgMThMNTQgMThMNTQgMTdMNTMgMTdMNTMgMTlMNTIgMTlMNTIgMTZMNTMgMTZMNTMgMTVMNTQgMTVMNTQgMTRMNTIgMTRMNTIgMTNMNTUgMTNMNTUgMTFMNTYgMTFMNTYgMTBMNTUgMTBMNTUgMTFMNTMgMTFMNTMgMTJMNTEgMTJMNTEgMTBMNTAgMTBMNTAgMTFMNDkgMTFMNDkgMTJMNTAgMTJMNTAgMTNMNDkgMTNMNDkgMTRMNDggMTRMNDggMTVMNDkgMTVMNDkgMTRMNTAgMTRMNTAgMTNMNTEgMTNMNTEgMTVMNTIgMTVMNTIgMTZMNTEgMTZMNTEgMTlMNTAgMTlMNTAgMjJMNDkgMjJMNDkgMjNMNTAgMjNMNTAgMjRMNTEgMjRMNTEgMjVMNTAgMjVMNTAgMjZMNDkgMjZMNDkgMjdMNTAgMjdMNTAgMzBMNDkgMzBMNDkgMzJMNDcgMzJMNDcgMzFMNDggMzFMNDggMjdMNDcgMjdMNDcgMjZMNDggMjZMNDggMjRMNDcgMjRMNDcgMjVMNDUgMjVMNDUgMjdMNDIgMjdMNDIgMjlMNDEgMjlMNDEgMzBMNDIgMzBMNDIgMzJMNDEgMzJMNDEgMzFMNDAgMzFMNDAgMzBMMzkgMzBMMzkgMzJMMzggMzJMMzggMzRMMzkgMzRMMzkgMzVMNDAgMzVMNDAgMzZMNDEgMzZMNDEgMzlMNDMgMzlMNDMgNDBMNDAgNDBMNDAgNDFMNDIgNDFMNDIgNDJMNDMgNDJMNDMgNDNMNDUgNDNMNDUgNDVMNDQgNDVMNDQgNDZMNDUgNDZMNDUgNDVMNDYgNDVMNDYgNDRMNDcgNDRMNDcgNDVMNTAgNDVMNTAgNDRMNDcgNDRMNDcgNDJMNDggNDJMNDggNDNMNTIgNDNMNTIgNDFMNTcgNDFMNTcgNDJMNTYgNDJMNTYgNDNMNTUgNDNMNTUgNDJMNTQgNDJMNTQgNDNMNTMgNDNMNTMgNDRMNTQgNDRMNTQgNDNMNTUgNDNMNTUgNDVMNTYgNDVMNTYgNDdMNTcgNDdMNTcgNDhMNTUgNDhMNTUgNDZMNTQgNDZMNTQgNDhMNTEgNDhMNTEgNDdMNTIgNDdMNTIgNDZMNTMgNDZMNTMgNDVMNTIgNDVMNTIgNDRMNTEgNDRMNTEgNDZMNDggNDZMNDggNDdMNTAgNDdMNTAgNDhMNDkgNDhMNDkgNDlMNDcgNDlMNDcgNTBMNDQgNTBMNDQgNTFMNDIgNTFMNDIgNTJMNDEgNTJMNDEgNTNMNDAgNTNMNDAgNTRMMzggNTRMMzggNTVMMzkgNTVMMzkgNTZMMzcgNTZMMzcgNTdMMzYgNTdMMzYgNTZMMzMgNTZMMzMgNTVMMzEgNTVMMzEgNTZMMjggNTZMMjggNTVMMjcgNTVMMjcgNTNMMjYgNTNMMjYgNTJMMjUgNTJMMjUgNTBMMjYgNTBMMjYgNDlMMjcgNDlMMjcgNTFMMjggNTFMMjggNTRMMjkgNTRMMjkgNTVMMzAgNTVMMzAgNTJMMjkgNTJMMjkgNTFMMjggNTFMMjggNTBMMjkgNTBMMjkgNDlMMzAgNDlMMzAgNTFMMzIgNTFMMzIgNTJMMzEgNTJMMzEgNTNMMzIgNTNMMzIgNTJMMzMgNTJMMzMgNTFMMzIgNTFMMzIgNTBMMzEgNTBMMzEgNDdMMzIgNDdMMzIgNDhMMzQgNDhMMzQgNDdMMzcgNDdMMzcgNDZMMzQgNDZMMzQgNDdMMzMgNDdMMzMgNDRMMzIgNDRMMzIgNDJMMzAgNDJMMzAgNDRMMjggNDRMMjggNDNMMjkgNDNMMjkgNDJMMjggNDJMMjggNDNMMjcgNDNMMjcgNDJMMjEgNDJMMjEgNDFMMjAgNDFMMjAgNDJMMTkgNDJMMTkgNDFMMTggNDFMMTggNDBMMTcgNDBMMTcgNDJMMTYgNDJMMTYgMzhMMTUgMzhMMTUgMzdMMTcgMzdMMTcgMzZMMTggMzZMMTggMzVMMTcgMzVMMTcgMzZMMTIgMzZMMTIgMzVMMTMgMzVMMTMgMzRMMTQgMzRMMTQgMzVMMTUgMzVMMTUgMzRMMTcgMzRMMTcgMzNMMTMgMzNMMTMgMzJMMTYgMzJMMTYgMzFMMTcgMzFMMTcgMzJMMTggMzJMMTggMzFMMTcgMzFMMTcgMjlMMTggMjlMMTggMzBMMTkgMzBMMTkgMzJMMjIgMzJMMjIgMzVMMjMgMzVMMjMgMzJMMjIgMzJMMjIgMzBMMjEgMzBMMjEgMjlMMjIgMjlMMjIgMjdMMjEgMjdMMjEgMjVMMjAgMjVMMjAgMjZMMTcgMjZMMTcgMjRMMTYgMjRMMTYgMjNMMTggMjNMMTggMjJMMTkgMjJMMTkgMTlMMTggMTlMMTggMTdMMTcgMTdMMTcgMThMMTUgMThMMTUgMTdMMTYgMTdMMTYgMTZMMTcgMTZMMTcgMTVMMTYgMTVMMTYgMTRMMTUgMTRMMTUgMTdMMTQgMTdMMTQgMTZMMTMgMTZMMTMgMTVMMTIgMTVMMTIgMTNMMTEgMTNMMTEgMTdMMTIgMTdMMTIgMThMMTMgMThMMTMgMjBMMTEgMjBMMTEgMjFMMTAgMjFMMTAgMjBMOSAyMEw5IDE5TDggMTlMOCAyMEw1IDIwTDUgMjFMOCAyMUw4IDIzTDcgMjNMNyAyMkw2IDIyTDYgMjNMNyAyM0w3IDI0TDYgMjRMNiAyNUw3IDI1TDcgMjRMOCAyNEw4IDI1TDkgMjVMOSAyN0wxMCAyN0wxMCAyOEwxMSAyOEwxMSAyOUwxMiAyOUwxMiAzMEwxMyAzMEwxMyAzMUwxMSAzMUwxMSAzMkwxMiAzMkwxMiAzNUwxMSAzNUwxMSAzNEwxMCAzNEwxMCAzNUwxMSAzNUwxMSAzNkwxMiAzNkwxMiAzN0wxNCAzN0wxNCAzOEwxMyAzOEwxMyAzOUwxNCAzOUwxNCA0MEwxMyA0MEwxMyA0MUwxNCA0MUwxNCA0MkwxNSA0MkwxNSA0M0wxMyA0M0wxMyA0MkwxMiA0MkwxMiA0M0wxMyA0M0wxMyA0NEwxMiA0NEwxMiA0NkwxMyA0NkwxMyA0N0wxMSA0N0wxMSA1MEwxMyA1MEwxMyA1MUwxMiA1MUwxMiA1M0wxMyA1M0wxMyA1NEwxNCA1NEwxNCA1M0wxNSA1M0wxNSA1NEwxNyA1NEwxNyA1M0wxNSA1M0wxNSA1MkwxNCA1MkwxNCA1MUwxNSA1MUwxNSA1MEwxNyA1MEwxNyA1MUwxNiA1MUwxNiA1MkwxOSA1MkwxOSA1M0wyMCA1M0wyMCA1MkwxOSA1MkwxOSA1MUwyMCA1MUwyMCA1MEwxOSA1MEwxOSA1MUwxOCA1MUwxOCA0OUwxOSA0OUwxOSA0OEwxOCA0OEwxOCA0N0wxOSA0N0wxOSA0NkwyMyA0NkwyMyA0N0wyMiA0N0wyMiA0OEwyMSA0OEwyMSA0N0wyMCA0N0wyMCA0OEwyMSA0OEwyMSA1MEwyMiA1MEwyMiA1MkwyMSA1MkwyMSA1M0wyMiA1M0wyMiA1MkwyMyA1MkwyMyA1M0wyNCA1M0wyNCA1MkwyNSA1MkwyNSA1M0wyNiA1M0wyNiA1NkwyNSA1NkwyNSA1NEwyNCA1NEwyNCA1NkwyMyA1NkwyMyA1NUwyMiA1NUwyMiA1N0wxOCA1N0wxOCA1OEwxOSA1OEwxOSA1OUwxNyA1OUwxNyA1OEwxNiA1OEwxNiA1N0wxNyA1N0wxNyA1NkwxNiA1NkwxNiA1NUwxNSA1NUwxNSA1NkwxNCA1NkwxNCA1NUwxMyA1NUwxMyA1NkwxMSA1NkwxMSA1OEwxMiA1OEwxMiA2MUwxMSA2MUwxMSA1OUwxMCA1OUwxMCA2MUw5IDYxTDkgNjJMOCA2Mkw4IDY3TDkgNjdMOSA2OEwxMCA2OEwxMCA3MEw5IDcwTDkgNzFMMTAgNzFMMTAgNzJMMTEgNzJMMTEgNzNMMTIgNzNMMTIgNzJMMTEgNzJMMTEgNjdMMTUgNjdMMTUgNjVMMTYgNjVMMTYgNjRMMTQgNjRMMTQgNjVMMTMgNjVMMTMgNjJMMTQgNjJMMTQgNjNMMTUgNjNMMTUgNjBMMTMgNjBMMTMgNTZMMTQgNTZMMTQgNThMMTYgNThMMTYgNTlMMTcgNTlMMTcgNjBMMTYgNjBMMTYgNjFMMTcgNjFMMTcgNjJMMTYgNjJMMTYgNjNMMTggNjNMMTggNjRMMTkgNjRMMTkgNjVMMjAgNjVMMjAgNjZMMTggNjZMMTggNjVMMTcgNjVMMTcgNjdMMTkgNjdMMTkgNjhMMjAgNjhMMjAgNjdMMjMgNjdMMjMgNjZMMjEgNjZMMjEgNjRMMjMgNjRMMjMgNjVMMjQgNjVMMjQgNjNMMjUgNjNMMjUgNjJMMjYgNjJMMjYgNjVMMjUgNjVMMjUgNjZMMjYgNjZMMjYgNjVMMjcgNjVMMjcgNjZMMjggNjZMMjggNjNMMjcgNjNMMjcgNjJMMjggNjJMMjggNjFMMjkgNjFMMjkgNjRMMzAgNjRMMzAgNjVMMjkgNjVMMjkgNjZMMzAgNjZMMzAgNjdMMjkgNjdMMjkgNjhMMjggNjhMMjggNjdMMjUgNjdMMjUgNjhMMjQgNjhMMjQgNjlMMjUgNjlMMjUgNjhMMjYgNjhMMjYgNzBMMjQgNzBMMjQgNzFMMjMgNzFMMjMgNzBMMjIgNzBMMjIgNzFMMjMgNzFMMjMgNzJMMjQgNzJMMjQgNzFMMjUgNzFMMjUgNzJMMjYgNzJMMjYgNzFMMjcgNzFMMjcgNjlMMjkgNjlMMjkgNjhMMzAgNjhMMzAgNzFMMzEgNzFMMzEgNzJMMjkgNzJMMjkgNzNMMzEgNzNMMzEgNzRMMzAgNzRMMzAgNzZMMzEgNzZMMzEgNzdMMzIgNzdMMzIgNzZMMzEgNzZMMzEgNzVMMzMgNzVMMzMgNzRMMzQgNzRMMzQgNzVMMzUgNzVMMzUgNzZMMzQgNzZMMzQgNzhMMzUgNzhMMzUgNzlMMzQgNzlMMzQgODBMMzUgODBMMzUgODFMMzYgODFMMzYgODBMMzcgODBMMzcgNzlMMzggNzlMMzggNzhMNDAgNzhMNDAgODBMNDIgODBMNDIgNzlMNDQgNzlMNDQgODBMNDUgODBMNDUgODNMNDQgODNMNDQgODFMNDMgODFMNDMgODJMNDIgODJMNDIgODNMNDQgODNMNDQgODRMNDUgODRMNDUgODNMNDYgODNMNDYgODRMNDcgODRMNDcgODNMNDggODNMNDggODJMNDcgODJMNDcgODFMNDggODFMNDggODBMNDkgODBMNDkgODFMNTAgODFMNTAgODBMNTEgODBMNTEgNzlMNTIgNzlMNTIgODBMNTMgODBMNTMgODFMNTQgODFMNTQgODBMNTUgODBMNTUgODFMNTYgODFMNTYgODBMNTUgODBMNTUgNzlMNTIgNzlMNTIgNzdMNTEgNzdMNTEgNzVMNTAgNzVMNTAgNzZMNDkgNzZMNDkgNzdMNTEgNzdMNTEgNzhMNTAgNzhMNTAgODBMNDkgODBMNDkgNzlMNDcgNzlMNDcgNzhMNDggNzhMNDggNzZMNDcgNzZMNDcgNzVMNDkgNzVMNDkgNzRMNDggNzRMNDggNzNMNDkgNzNMNDkgNzJMNTEgNzJMNTEgNzFMNTQgNzFMNTQgNzJMNTIgNzJMNTIgNzNMNTQgNzNMNTQgNzJMNTUgNzJMNTUgNzNMNTYgNzNMNTYgNzJMNTggNzJMNTggNzFMNTkgNzFMNTkgNzJMNjAgNzJMNjAgNzFMNjEgNzFMNjEgNzNMNjAgNzNMNjAgODBMNjEgODBMNjEgODFMNjIgODFMNjIgODBMNjMgODBMNjMgNzlMNjQgNzlMNjQgODBMNjYgODBMNjYgODFMNjggODFMNjggODJMNjkgODJMNjkgODFMNzAgODFMNzAgODJMNzEgODJMNzEgODNMNzAgODNMNzAgODRMNzEgODRMNzEgODNMNzIgODNMNzIgODVMNzMgODVMNzMgODdMNzQgODdMNzQgODZMNzUgODZMNzUgODVMNzQgODVMNzQgODRMNzUgODRMNzUgODNMNzYgODNMNzYgODJMNzcgODJMNzcgODBMNzggODBMNzggNzlMNzcgNzlMNzcgNzhMNzUgNzhMNzUgNzlMNzQgNzlMNzQgNzdMNzMgNzdMNzMgNzVMNzIgNzVMNzIgNzdMNzEgNzdMNzEgNzhMNzIgNzhMNzIgNzlMNzQgNzlMNzQgODBMNzIgODBMNzIgODJMNzEgODJMNzEgNzlMNzAgNzlMNzAgNzhMNjkgNzhMNjkgNzdMNjggNzdMNjggNzZMNzAgNzZMNzAgNzVMNjcgNzVMNjcgNzRMNjkgNzRMNjkgNzNMNjggNzNMNjggNzFMNjkgNzFMNjkgNzJMNzAgNzJMNzAgNzFMNjkgNzFMNjkgNjlMNzEgNjlMNzEgNjhMNjkgNjhMNjkgNjdMNjggNjdMNjggNjhMNjcgNjhMNjcgNjZMNjYgNjZMNjYgNjdMNjUgNjdMNjUgNjZMNjQgNjZMNjQgNjVMNjIgNjVMNjIgNjRMNjMgNjRMNjMgNjNMNjQgNjNMNjQgNjRMNjUgNjRMNjUgNjNMNjQgNjNMNjQgNjJMNjMgNjJMNjMgNjNMNjEgNjNMNjEgNjJMNjIgNjJMNjIgNjFMNjMgNjFMNjMgNjBMNjQgNjBMNjQgNTlMNjUgNTlMNjUgNjBMNjYgNjBMNjYgNThMNjUgNThMNjUgNTdMNjYgNTdMNjYgNTZMNjUgNTZMNjUgNTVMNjQgNTVMNjQgNTlMNjIgNTlMNjIgNjBMNjEgNjBMNjEgNThMNjIgNThMNjIgNTdMNjMgNTdMNjMgNTVMNjIgNTVMNjIgNTJMNjAgNTJMNjAgNTNMNTggNTNMNTggNTJMNTYgNTJMNTYgNTBMNTggNTBMNTggNTFMNTkgNTFMNTkgNTBMNTggNTBMNTggNDlMNTcgNDlMNTcgNDhMNTkgNDhMNTkgNDlMNjAgNDlMNjAgNTBMNjEgNTBMNjEgNTFMNjIgNTFMNjIgNTBMNjMgNTBMNjMgNTFMNjQgNTFMNjQgNTBMNjUgNTBMNjUgNTJMNjYgNTJMNjYgNTFMNjcgNTFMNjcgNTNMNjggNTNMNjggNTRMNjkgNTRMNjkgNTNMNzAgNTNMNzAgNTFMNjkgNTFMNjkgNTJMNjggNTJMNjggNTFMNjcgNTFMNjcgNTBMNjkgNTBMNjkgNDZMNjggNDZMNjggNDVMNjkgNDVMNjkgNDRMNzIgNDRMNzIgNDZMNzEgNDZMNzEgNDVMNzAgNDVMNzAgNDZMNzEgNDZMNzEgNDdMNzAgNDdMNzAgNDhMNzEgNDhMNzEgNDdMNzQgNDdMNzQgNDhMNzIgNDhMNzIgNTBMNzEgNTBMNzEgNDlMNzAgNDlMNzAgNTBMNzEgNTBMNzEgNTFMNzIgNTFMNzIgNTBMNzQgNTBMNzQgNDlMNzUgNDlMNzUgNDdMNzcgNDdMNzcgNDlMODAgNDlMODAgNTBMODEgNTBMODEgNDlMODAgNDlMODAgNDhMNzkgNDhMNzkgNDdMNzcgNDdMNzcgNDZMNzUgNDZMNzUgNDVMNzMgNDVMNzMgNDRMNzQgNDRMNzQgNDFMNzUgNDFMNzUgNDJMNzYgNDJMNzYgNDFMNzUgNDFMNzUgNDBMNzQgNDBMNzQgMzhMNzUgMzhMNzUgMzlMNzYgMzlMNzYgNDBMNzggNDBMNzggNDJMODAgNDJMODAgNDNMNzYgNDNMNzYgNDRMNzkgNDRMNzkgNDZMODAgNDZMODAgNDRMODEgNDRMODEgNDVMODIgNDVMODIgNDRMODMgNDRMODMgNDNMODEgNDNMODEgNDJMODAgNDJMODAgMzlMNzkgMzlMNzkgMzhMNzggMzhMNzggMzlMNzcgMzlMNzcgMzhMNzUgMzhMNzUgMzVMNzYgMzVMNzYgMzNMNzcgMzNMNzcgMzJMNzYgMzJMNzYgMzNMNzUgMzNMNzUgMzJMNzMgMzJMNzMgMzFMNzUgMzFMNzUgMzBMNzYgMzBMNzYgMzFMNzcgMzFMNzcgMzBMNzYgMzBMNzYgMjlMNzUgMjlMNzUgMjhMNzQgMjhMNzQgMjdMNzYgMjdMNzYgMjhMNzggMjhMNzggMzBMODAgMzBMODAgMjhMODMgMjhMODMgMjRMODUgMjRMODUgMjVMODQgMjVMODQgMjZMODUgMjZMODUgMjVMODYgMjVMODYgMjZMODggMjZMODggMjRMODkgMjRMODkgMjNMODggMjNMODggMjJMODcgMjJMODcgMjNMODYgMjNMODYgMjJMODUgMjJMODUgMjNMODMgMjNMODMgMjRMODIgMjRMODIgMjNMODEgMjNMODEgMjBMODIgMjBMODIgMTlMODQgMTlMODQgMThMODMgMThMODMgMTdMODQgMTdMODQgMTVMODMgMTVMODMgMTRMODIgMTRMODIgMTVMODAgMTVMODAgMTRMNzkgMTRMNzkgMTNMODAgMTNMODAgMTJMODEgMTJMODEgMTFMODAgMTFMODAgMTBMNzkgMTBMNzkgOUw3OCA5TDc4IDhMNzYgOEw3NiA5TDc1IDlMNzUgMTBMNzQgMTBMNzQgOFpNNiA5TDYgMTBMNyAxMEw3IDlaTTY4IDlMNjggMTFMNjYgMTFMNjYgMTNMNjggMTNMNjggMTRMNjkgMTRMNjkgMTNMNjggMTNMNjggMTJMNjkgMTJMNjkgOVpNNzYgOUw3NiAxMEw3NyAxMEw3NyAxMkw3OSAxMkw3OSAxMEw3OCAxMEw3OCA5Wk0zOSAxMEwzOSAxMUw0MSAxMUw0MSAxMFpNMiAxMUwyIDEyTDMgMTJMMyAxMVpNMTUgMTFMMTUgMTJMMTYgMTJMMTYgMTFaTTE4IDExTDE4IDEyTDE5IDEyTDE5IDExWk0zNyAxMUwzNyAxMkwzOCAxMkwzOCAxMVpNMTMgMTJMMTMgMTRMMTQgMTRMMTQgMTJaTTQzIDEyTDQzIDEzTDQyIDEzTDQyIDE0TDQ0IDE0TDQ0IDEzTDQ1IDEzTDQ1IDEyWk01NyAxM0w1NyAxNEw1OCAxNEw1OCAxNUw1OSAxNUw1OSAxNEw1OCAxNEw1OCAxM1pNMzIgMTRMMzIgMTVMMzMgMTVMMzMgMTRaTTY0IDE0TDY0IDE1TDYyIDE1TDYyIDE5TDYxIDE5TDYxIDIwTDYwIDIwTDYwIDIxTDYxIDIxTDYxIDIwTDYyIDIwTDYyIDE5TDYzIDE5TDYzIDE4TDY3IDE4TDY3IDE3TDY2IDE3TDY2IDE2TDY3IDE2TDY3IDE1TDY2IDE1TDY2IDE2TDY0IDE2TDY0IDE1TDY1IDE1TDY1IDE0Wk0yMyAxNUwyMyAxOEwyMiAxOEwyMiAxN0wxOSAxN0wxOSAxOEwyMiAxOEwyMiAyMEwyMSAyMEwyMSAxOUwyMCAxOUwyMCAyMEwyMSAyMEwyMSAyMUwyMCAyMUwyMCAyMkwyMSAyMkwyMSAyMUwyMyAyMUwyMyAyMkwyNCAyMkwyNCAyNEwyNSAyNEwyNSAyNUwyNiAyNUwyNiAyM0wyNSAyM0wyNSAyMEwyNCAyMEwyNCAxOUwyNiAxOUwyNiAxN0wyNCAxN0wyNCAxNVpNMzUgMTVMMzUgMTZMMzQgMTZMMzQgMTdMMzMgMTdMMzMgMThMMzQgMThMMzQgMTdMMzUgMTdMMzUgMTZMMzYgMTZMMzYgMTVaTTgyIDE1TDgyIDE2TDgxIDE2TDgxIDE4TDgyIDE4TDgyIDE3TDgzIDE3TDgzIDE1Wk0xMiAxNkwxMiAxN0wxMyAxN0wxMyAxOEwxNCAxOEwxNCAyMkwxMyAyMkwxMyAyMUwxMiAyMUwxMiAyMkwxMyAyMkwxMyAyM0wxNCAyM0wxNCAyNEwxMCAyNEwxMCAyMUw5IDIxTDkgMjBMOCAyMEw4IDIxTDkgMjFMOSAyM0w4IDIzTDggMjRMMTAgMjRMMTAgMjdMMTEgMjdMMTEgMjhMMTMgMjhMMTMgMzBMMTQgMzBMMTQgMzFMMTUgMzFMMTUgMzBMMTYgMzBMMTYgMjlMMTcgMjlMMTcgMjdMMTUgMjdMMTUgMjVMMTYgMjVMMTYgMjRMMTUgMjRMMTUgMjNMMTYgMjNMMTYgMjFMMTcgMjFMMTcgMTlMMTYgMTlMMTYgMjBMMTUgMjBMMTUgMThMMTQgMThMMTQgMTdMMTMgMTdMMTMgMTZaTTQ2IDE3TDQ2IDIwTDQ3IDIwTDQ3IDIxTDQ2IDIxTDQ2IDIzTDQ0IDIzTDQ0IDI0TDQ2IDI0TDQ2IDIzTDQ4IDIzTDQ4IDIyTDQ3IDIyTDQ3IDIxTDQ4IDIxTDQ4IDE5TDQ3IDE5TDQ3IDE4TDQ5IDE4TDQ5IDE3Wk04OCAxN0w4OCAxOEw4OSAxOEw4OSAxN1pNNiAxOEw2IDE5TDcgMTlMNyAxOFpNMTAgMThMMTAgMTlMMTEgMTlMMTEgMThaTTcyIDE4TDcyIDE5TDczIDE5TDczIDE4Wk03OCAxOUw3OCAyMEw3OSAyMEw3OSAxOVpNODAgMTlMODAgMjBMODEgMjBMODEgMTlaTTI2IDIwTDI2IDIyTDI3IDIyTDI3IDIwWk0zNSAyMEwzNSAyMUwzNiAyMUwzNiAyMFpNNTcgMjBMNTcgMjFMNTggMjFMNTggMjJMNTkgMjJMNTkgMjFMNTggMjFMNTggMjBaTTgzIDIwTDgzIDIxTDgyIDIxTDgyIDIyTDgzIDIyTDgzIDIxTDg0IDIxTDg0IDIwWk0zIDIxTDMgMjJMNCAyMkw0IDIxWk01MCAyMkw1MCAyM0w1MiAyM0w1MiAyMlpNNTUgMjJMNTUgMjRMNTcgMjRMNTcgMjNMNTYgMjNMNTYgMjJaTTYxIDIyTDYxIDI0TDYzIDI0TDYzIDI1TDY0IDI1TDY0IDI0TDY1IDI0TDY1IDI3TDY2IDI3TDY2IDI4TDY3IDI4TDY3IDI2TDY4IDI2TDY4IDI3TDY5IDI3TDY5IDI4TDY4IDI4TDY4IDI5TDY5IDI5TDY5IDMxTDY4IDMxTDY4IDMyTDY5IDMyTDY5IDMxTDcwIDMxTDcwIDMzTDY4IDMzTDY4IDM1TDcwIDM1TDcwIDM2TDY4IDM2TDY4IDM3TDY3IDM3TDY3IDM4TDY2IDM4TDY2IDM3TDY1IDM3TDY1IDM1TDY0IDM1TDY0IDM0TDYyIDM0TDYyIDM1TDYxIDM1TDYxIDMzTDYyIDMzTDYyIDMyTDYxIDMyTDYxIDMzTDU2IDMzTDU2IDMyTDU1IDMyTDU1IDMzTDU0IDMzTDU0IDMyTDUxIDMyTDUxIDMxTDUzIDMxTDUzIDMwTDU0IDMwTDU0IDI5TDU1IDI5TDU1IDMwTDU2IDMwTDU2IDI5TDU1IDI5TDU1IDI3TDU0IDI3TDU0IDI1TDUzIDI1TDUzIDI0TDUyIDI0TDUyIDI3TDUzIDI3TDUzIDMwTDUxIDMwTDUxIDMxTDUwIDMxTDUwIDMzTDQ3IDMzTDQ3IDM0TDQ2IDM0TDQ2IDM1TDQ3IDM1TDQ3IDM2TDQ5IDM2TDQ5IDM3TDUyIDM3TDUyIDM2TDUzIDM2TDUzIDM1TDU2IDM1TDU2IDM0TDU4IDM0TDU4IDM1TDU3IDM1TDU3IDM3TDU4IDM3TDU4IDM4TDU2IDM4TDU2IDM5TDU1IDM5TDU1IDQwTDU4IDQwTDU4IDM4TDYxIDM4TDYxIDM3TDYyIDM3TDYyIDM2TDYzIDM2TDYzIDM3TDY1IDM3TDY1IDM4TDYzIDM4TDYzIDQwTDYyIDQwTDYyIDM5TDYwIDM5TDYwIDQwTDYxIDQwTDYxIDQxTDYwIDQxTDYwIDQyTDYxIDQyTDYxIDQxTDY0IDQxTDY0IDQyTDY1IDQyTDY1IDQzTDcxIDQzTDcxIDQyTDcyIDQyTDcyIDQwTDczIDQwTDczIDQxTDc0IDQxTDc0IDQwTDczIDQwTDczIDM5TDcyIDM5TDcyIDM4TDczIDM4TDczIDM3TDc0IDM3TDc0IDM2TDczIDM2TDczIDM3TDcyIDM3TDcyIDM4TDcxIDM4TDcxIDM3TDcwIDM3TDcwIDM2TDcxIDM2TDcxIDM1TDcwIDM1TDcwIDMzTDcxIDMzTDcxIDM0TDcyIDM0TDcyIDM1TDczIDM1TDczIDMyTDcyIDMyTDcyIDMxTDczIDMxTDczIDMwTDcxIDMwTDcxIDI5TDcyIDI5TDcyIDI4TDcxIDI4TDcxIDI5TDY5IDI5TDY5IDI4TDcwIDI4TDcwIDI3TDcxIDI3TDcxIDI2TDcyIDI2TDcyIDI3TDczIDI3TDczIDI2TDcyIDI2TDcyIDI1TDczIDI1TDczIDI0TDcxIDI0TDcxIDIzTDcwIDIzTDcwIDI0TDY5IDI0TDY5IDI1TDY4IDI1TDY4IDIzTDY3IDIzTDY3IDI0TDY1IDI0TDY1IDIzTDYyIDIzTDYyIDIyWk0zMCAyM0wzMCAyNEwzMiAyNEwzMiAyM1pNODUgMjNMODUgMjRMODYgMjRMODYgMjNaTTg3IDIzTDg3IDI0TDg4IDI0TDg4IDIzWk0wIDI0TDAgMjZMMSAyNkwxIDI0Wk0zIDI0TDMgMjZMNCAyNkw0IDI0Wk0zNyAyNEwzNyAyNkwzOCAyNkwzOCAyNFpNNzAgMjRMNzAgMjVMNzEgMjVMNzEgMjRaTTgwIDI0TDgwIDI2TDc5IDI2TDc5IDI3TDc4IDI3TDc4IDI4TDc5IDI4TDc5IDI3TDgyIDI3TDgyIDI0Wk05MSAyNEw5MSAyNUw5MiAyNUw5MiAyNFpNMTMgMjVMMTMgMjZMMTQgMjZMMTQgMjVaTTExIDI2TDExIDI3TDEyIDI3TDEyIDI2Wk02MyAyNkw2MyAyN0w2NCAyN0w2NCAyNlpNMTMgMjdMMTMgMjhMMTQgMjhMMTQgMjlMMTYgMjlMMTYgMjhMMTQgMjhMMTQgMjdaTTE4IDI3TDE4IDI4TDE5IDI4TDE5IDI5TDIxIDI5TDIxIDI4TDIwIDI4TDIwIDI3Wk00NSAyN0w0NSAyOEw0NCAyOEw0NCAyOUw0NSAyOUw0NSAzMEw0NyAzMEw0NyAyN1pNMyAyOEwzIDI5TDQgMjlMNCAyOFpNNDUgMjhMNDUgMjlMNDYgMjlMNDYgMjhaTTUgMjlMNSAzMkw4IDMyTDggMjlaTTI3IDI5TDI3IDMwTDI2IDMwTDI2IDMxTDI4IDMxTDI4IDI5Wk0yOSAyOUwyOSAzMkwzMiAzMkwzMiAyOVpNNDIgMjlMNDIgMzBMNDMgMzBMNDMgMzFMNDQgMzFMNDQgMzJMNDMgMzJMNDMgMzNMNDIgMzNMNDIgMzZMNDMgMzZMNDMgMzdMNDQgMzdMNDQgMzZMNDMgMzZMNDMgMzNMNDQgMzNMNDQgMzRMNDUgMzRMNDUgMzNMNDQgMzNMNDQgMzJMNDYgMzJMNDYgMzFMNDQgMzFMNDQgMzBMNDMgMzBMNDMgMjlaTTU3IDI5TDU3IDMyTDYwIDMyTDYwIDI5Wk04NSAyOUw4NSAzMkw4OCAzMkw4OCAyOVpNMyAzMEwzIDMxTDQgMzFMNCAzMFpNNiAzMEw2IDMxTDcgMzFMNyAzMFpNMzAgMzBMMzAgMzFMMzEgMzFMMzEgMzBaTTU4IDMwTDU4IDMxTDU5IDMxTDU5IDMwWk04NiAzMEw4NiAzMUw4NyAzMUw4NyAzMFpNMCAzMkwwIDMzTDEgMzNMMSAzMlpNMzMgMzJMMzMgMzNMMzIgMzNMMzIgMzZMMzMgMzZMMzMgMzVMMzQgMzVMMzQgMzZMMzUgMzZMMzUgMzRMMzYgMzRMMzYgMzNMMzUgMzNMMzUgMzRMMzMgMzRMMzMgMzNMMzQgMzNMMzQgMzJaTTE5IDMzTDE5IDM2TDIwIDM2TDIwIDMzWk0zMCAzM0wzMCAzNUwzMSAzNUwzMSAzM1pNNTAgMzNMNTAgMzRMNDkgMzRMNDkgMzZMNTIgMzZMNTIgMzRMNTMgMzRMNTMgMzNMNTIgMzNMNTIgMzRMNTEgMzRMNTEgMzNaTTU1IDMzTDU1IDM0TDU2IDM0TDU2IDMzWk03NCAzM0w3NCAzNEw3NSAzNEw3NSAzM1pNMjQgMzRMMjQgMzVMMjUgMzVMMjUgMzRaTTU5IDM0TDU5IDM1TDU4IDM1TDU4IDM2TDU5IDM2TDU5IDM1TDYwIDM1TDYwIDM2TDYxIDM2TDYxIDM1TDYwIDM1TDYwIDM0Wk03NyAzNEw3NyAzNUw3OCAzNUw3OCAzN0w4MCAzN0w4MCAzOEw4MSAzOEw4MSA0MUw4MiA0MUw4MiAzOEw4MSAzOEw4MSAzN0w4MCAzN0w4MCAzNUw3OCAzNUw3OCAzNFpNMzggMzZMMzggMzdMMzkgMzdMMzkgMzZaTTU0IDM2TDU0IDM4TDU1IDM4TDU1IDM3TDU2IDM3TDU2IDM2Wk03NiAzNkw3NiAzN0w3NyAzN0w3NyAzNlpNMCAzN0wwIDM4TDEgMzhMMSAzN1pNMjMgMzdMMjMgMzhMMjQgMzhMMjQgMzdaTTI1IDM3TDI1IDM4TDI2IDM4TDI2IDM5TDI3IDM5TDI3IDQwTDI4IDQwTDI4IDM5TDI3IDM5TDI3IDM4TDI2IDM4TDI2IDM3Wk0zNSAzN0wzNSAzOEwzNiAzOEwzNiAzN1pNNDUgMzdMNDUgMzhMNDYgMzhMNDYgMzlMNDUgMzlMNDUgNDBMNDQgNDBMNDQgNDFMNDUgNDFMNDUgNDNMNDYgNDNMNDYgNDFMNDUgNDFMNDUgNDBMNDcgNDBMNDcgNDFMNDkgNDFMNDkgNDJMNTAgNDJMNTAgNDFMNTIgNDFMNTIgNDBMNTMgNDBMNTMgMzhMNTIgMzhMNTIgMzlMNTEgMzlMNTEgMzhMNDkgMzhMNDkgMzlMNDcgMzlMNDcgMzhMNDYgMzhMNDYgMzdaTTY4IDM3TDY4IDM4TDY5IDM4TDY5IDM3Wk0zOSAzOEwzOSAzOUw0MCAzOUw0MCAzOFpNNzAgMzhMNzAgMzlMNjkgMzlMNjkgNDBMNjggNDBMNjggMzlMNjUgMzlMNjUgNDFMNjYgNDFMNjYgNDJMNjggNDJMNjggNDFMNjkgNDFMNjkgNDBMNzAgNDBMNzAgNDJMNzEgNDJMNzEgMzhaTTUwIDM5TDUwIDQwTDUxIDQwTDUxIDM5Wk0zNiA0MEwzNiA0MUwzNyA0MUwzNyA0MFpNNiA0MUw2IDQyTDcgNDJMNyA0MVpNNTggNDFMNTggNDJMNTcgNDJMNTcgNDRMNTggNDRMNTggNDVMNTkgNDVMNTkgNDZMNjEgNDZMNjEgNDNMNjAgNDNMNjAgNDRMNTkgNDRMNTkgNDFaTTE4IDQyTDE4IDQzTDE5IDQzTDE5IDQ0TDE3IDQ0TDE3IDQzTDE1IDQzTDE1IDQ0TDEzIDQ0TDEzIDQ1TDE1IDQ1TDE1IDQ0TDE3IDQ0TDE3IDQ2TDE4IDQ2TDE4IDQ1TDE5IDQ1TDE5IDQ0TDIwIDQ0TDIwIDQ1TDIzIDQ1TDIzIDQ2TDI0IDQ2TDI0IDQ3TDIzIDQ3TDIzIDQ4TDIyIDQ4TDIyIDUwTDIzIDUwTDIzIDUxTDI0IDUxTDI0IDUwTDI1IDUwTDI1IDQ5TDI2IDQ5TDI2IDQ2TDI4IDQ2TDI4IDQ3TDI5IDQ3TDI5IDQ4TDI4IDQ4TDI4IDQ5TDI5IDQ5TDI5IDQ4TDMwIDQ4TDMwIDQ3TDMxIDQ3TDMxIDQ2TDI4IDQ2TDI4IDQ0TDI3IDQ0TDI3IDQ1TDI2IDQ1TDI2IDQ0TDI1IDQ0TDI1IDQ1TDIzIDQ1TDIzIDQ0TDI0IDQ0TDI0IDQzTDIxIDQzTDIxIDQ0TDIwIDQ0TDIwIDQzTDE5IDQzTDE5IDQyWk00MCA0Mkw0MCA0M0w0MSA0M0w0MSA0MlpNNjIgNDNMNjIgNDRMNjMgNDRMNjMgNDVMNjIgNDVMNjIgNDZMNjMgNDZMNjMgNDdMNjEgNDdMNjEgNDhMNjMgNDhMNjMgNDlMNjUgNDlMNjUgNTBMNjYgNTBMNjYgNDhMNjQgNDhMNjQgNDZMNjUgNDZMNjUgNDdMNjYgNDdMNjYgNDZMNjcgNDZMNjcgNDRMNjQgNDRMNjQgNDNaTTkyIDQzTDkyIDQ0TDkxIDQ0TDkxIDQ1TDkzIDQ1TDkzIDQzWk02IDQ0TDYgNDVMNSA0NUw1IDQ2TDQgNDZMNCA0N0w1IDQ3TDUgNDhMNiA0OEw2IDQ5TDggNDlMOCA1MEw5IDUwTDkgNTFMMTAgNTFMMTAgNTJMMTEgNTJMMTEgNTFMMTAgNTFMMTAgNDhMOSA0OEw5IDQ3TDggNDdMOCA0OEw2IDQ4TDYgNDdMNyA0N0w3IDQ2TDYgNDZMNiA0NUw3IDQ1TDcgNDRaTTMxIDQ0TDMxIDQ1TDMyIDQ1TDMyIDQ0Wk0zNSA0NEwzNSA0NUwzNiA0NUwzNiA0NFpNMjUgNDVMMjUgNDZMMjYgNDZMMjYgNDVaTTQyIDQ1TDQyIDQ2TDQzIDQ2TDQzIDQ1Wk02MyA0NUw2MyA0Nkw2NCA0Nkw2NCA0NVpNMTQgNDZMMTQgNDdMMTUgNDdMMTUgNDlMMTQgNDlMMTQgNDhMMTIgNDhMMTIgNDlMMTMgNDlMMTMgNTBMMTUgNTBMMTUgNDlMMTggNDlMMTggNDhMMTYgNDhMMTYgNDdMMTUgNDdMMTUgNDZaTTc0IDQ2TDc0IDQ3TDc1IDQ3TDc1IDQ2Wk04OCA0Nkw4OCA0N0w4OSA0N0w4OSA0NlpNMjQgNDdMMjQgNDhMMjMgNDhMMjMgNTBMMjQgNTBMMjQgNDlMMjUgNDlMMjUgNDdaTTU5IDQ3TDU5IDQ4TDYwIDQ4TDYwIDQ3Wk02NyA0N0w2NyA0OEw2OCA0OEw2OCA0N1pNOCA0OEw4IDQ5TDkgNDlMOSA0OFpNNTAgNDhMNTAgNDlMNDkgNDlMNDkgNTBMNDggNTBMNDggNTFMNTAgNTFMNTAgNTJMNTEgNTJMNTEgNTRMNTIgNTRMNTIgNTVMNTAgNTVMNTAgNTZMNTIgNTZMNTIgNTVMNTMgNTVMNTMgNTdMNTEgNTdMNTEgNThMNDkgNThMNDkgNTdMNDggNTdMNDggNTVMNDkgNTVMNDkgNTRMNDggNTRMNDggNTVMNDcgNTVMNDcgNTZMNDYgNTZMNDYgNTVMNDQgNTVMNDQgNTNMNDUgNTNMNDUgNTRMNDYgNTRMNDYgNTNMNDkgNTNMNDkgNTJMNDYgNTJMNDYgNTNMNDUgNTNMNDUgNTJMNDQgNTJMNDQgNTNMNDEgNTNMNDEgNTRMNDIgNTRMNDIgNTVMNDAgNTVMNDAgNTZMMzkgNTZMMzkgNTdMMzcgNTdMMzcgNTlMMzUgNTlMMzUgNTdMMzMgNTdMMzMgNTlMMzQgNTlMMzQgNjJMMzMgNjJMMzMgNjFMMzEgNjFMMzEgNjNMMzAgNjNMMzAgNjRMMzEgNjRMMzEgNjNMMzIgNjNMMzIgNjJMMzMgNjJMMzMgNjNMMzQgNjNMMzQgNjRMMzYgNjRMMzYgNjVMMzMgNjVMMzMgNjRMMzIgNjRMMzIgNjVMMzEgNjVMMzEgNjdMMzAgNjdMMzAgNjhMMzEgNjhMMzEgNzBMMzIgNzBMMzIgNzFMMzMgNzFMMzMgNzJMMzIgNzJMMzIgNzNMMzQgNzNMMzQgNzRMMzYgNzRMMzYgNzNMMzcgNzNMMzcgNzVMMzYgNzVMMzYgNzZMMzUgNzZMMzUgNzhMMzcgNzhMMzcgNzdMMzggNzdMMzggNzNMNDAgNzNMNDAgNjlMNDEgNjlMNDEgNzFMNDQgNzFMNDQgNzBMNDMgNzBMNDMgNjhMNDQgNjhMNDQgNjlMNDUgNjlMNDUgNzBMNDYgNzBMNDYgNzRMNDUgNzRMNDUgNzNMNDMgNzNMNDMgNzJMNDEgNzJMNDEgNzNMNDIgNzNMNDIgNzRMNDMgNzRMNDMgNzVMNDQgNzVMNDQgNzRMNDUgNzRMNDUgNzVMNDcgNzVMNDcgNzJMNDkgNzJMNDkgNzBMNTAgNzBMNTAgNzFMNTEgNzFMNTEgNzBMNTIgNzBMNTIgNjlMNTEgNjlMNTEgNjhMNTIgNjhMNTIgNjdMNTMgNjdMNTMgNjhMNTQgNjhMNTQgNjdMNTUgNjdMNTUgNzJMNTYgNzJMNTYgNjhMNTggNjhMNTggNjlMNjAgNjlMNjAgNzBMNTkgNzBMNTkgNzFMNjAgNzFMNjAgNzBMNjEgNzBMNjEgNjlMNjAgNjlMNjAgNjdMNjEgNjdMNjEgNjhMNjIgNjhMNjIgNjlMNjMgNjlMNjMgNzBMNjIgNzBMNjIgNzFMNjMgNzFMNjMgNzNMNjEgNzNMNjEgNzRMNjIgNzRMNjIgNzVMNjEgNzVMNjEgNzdMNjQgNzdMNjQgNzVMNjYgNzVMNjYgNzNMNjcgNzNMNjcgNzJMNjYgNzJMNjYgNzFMNjggNzFMNjggNzBMNjcgNzBMNjcgNjhMNjUgNjhMNjUgNjdMNjQgNjdMNjQgNjhMNjMgNjhMNjMgNjZMNjEgNjZMNjEgNjNMNTggNjNMNTggNjJMNTYgNjJMNTYgNTdMNTUgNTdMNTUgNTlMNTQgNTlMNTQgNjBMNTUgNjBMNTUgNjNMNTMgNjNMNTMgNjJMNTQgNjJMNTQgNjFMNTMgNjFMNTMgNjBMNTIgNjBMNTIgNTlMNTEgNTlMNTEgNThMNTQgNThMNTQgNTZMNTUgNTZMNTUgNTVMNTMgNTVMNTMgNTRMNTIgNTRMNTIgNTFMNTMgNTFMNTMgNTBMNTQgNTBMNTQgNTJMNTMgNTJMNTMgNTNMNTQgNTNMNTQgNTRMNTUgNTRMNTUgNTNMNTQgNTNMNTQgNTJMNTUgNTJMNTUgNTBMNTQgNTBMNTQgNDlMNTUgNDlMNTUgNDhMNTQgNDhMNTQgNDlMNTIgNDlMNTIgNTFMNTEgNTFMNTEgNDhaTTMzIDQ5TDMzIDUwTDM0IDUwTDM0IDUxTDM1IDUxTDM1IDQ5Wk04MiA0OUw4MiA1MUw4MyA1MUw4MyA0OVpNNzggNTBMNzggNTFMNzkgNTFMNzkgNTBaTTg1IDUxTDg1IDUyTDg2IDUyTDg2IDUxWk03NCA1Mkw3NCA1NEw3NSA1NEw3NSA1MlpNNjAgNTNMNjAgNTRMNTYgNTRMNTYgNTZMNTcgNTZMNTcgNTVMNjAgNTVMNjAgNTZMNjIgNTZMNjIgNTVMNjAgNTVMNjAgNTRMNjEgNTRMNjEgNTNaTTYgNTRMNiA1NUw3IDU1TDcgNTRaTTE4IDU0TDE4IDU1TDIwIDU1TDIwIDU0Wk04MyA1NEw4MyA1NUw4NSA1NUw4NSA1NFpNMiA1NUwyIDU3TDMgNTdMMyA1NVpNNDIgNTVMNDIgNTZMNDEgNTZMNDEgNTdMNDAgNTdMNDAgNTlMMzkgNTlMMzkgNThMMzggNThMMzggNTlMMzcgNTlMMzcgNjBMMzggNjBMMzggNTlMMzkgNTlMMzkgNjFMNDAgNjFMNDAgNjBMNDEgNjBMNDEgNTlMNDUgNTlMNDUgNThMNDYgNThMNDYgNTZMNDQgNTZMNDQgNTdMNDMgNTdMNDMgNTVaTTE1IDU2TDE1IDU3TDE2IDU3TDE2IDU2Wk01IDU3TDUgNjBMOCA2MEw4IDU3Wk0yNCA1N0wyNCA1OEwyMyA1OEwyMyA1OUwyMSA1OUwyMSA2MEwyMCA2MEwyMCA1OUwxOSA1OUwxOSA2MEwyMCA2MEwyMCA2MkwyMSA2MkwyMSA2M0wyMiA2M0wyMiA2MUwyMyA2MUwyMyA2MkwyNSA2MkwyNSA2MUwyMyA2MUwyMyA2MEwyNyA2MEwyNyA2MUwyOCA2MUwyOCA2MEwyNyA2MEwyNyA1OUwyOCA1OUwyOCA1OEwyNyA1OEwyNyA1N1pNMjkgNTdMMjkgNjBMMzIgNjBMMzIgNTdaTTQxIDU3TDQxIDU4TDQzIDU4TDQzIDU3Wk00NyA1N0w0NyA1OEw0OCA1OEw0OCA1N1pNNTcgNTdMNTcgNjBMNjAgNjBMNjAgNTdaTTg1IDU3TDg1IDYwTDg4IDYwTDg4IDU3Wk02IDU4TDYgNTlMNyA1OUw3IDU4Wk0yNCA1OEwyNCA1OUwyNSA1OUwyNSA1OFpNMzAgNThMMzAgNTlMMzEgNTlMMzEgNThaTTU4IDU4TDU4IDU5TDU5IDU5TDU5IDU4Wk03NSA1OEw3NSA1OUw3NyA1OUw3NyA1OFpNODYgNThMODYgNTlMODcgNTlMODcgNThaTTg5IDU4TDg5IDU5TDkwIDU5TDkwIDU4Wk00NiA1OUw0NiA2MEw0NCA2MEw0NCA2MUw0MyA2MUw0MyA2MEw0MiA2MEw0MiA2MUw0MSA2MUw0MSA2Mkw0MiA2Mkw0MiA2MUw0MyA2MUw0MyA2Mkw0NCA2Mkw0NCA2M0w0MyA2M0w0MyA2NUw0NCA2NUw0NCA2M0w0NSA2M0w0NSA2NUw0NiA2NUw0NiA2Nkw0NSA2Nkw0NSA2N0w0NiA2N0w0NiA2OEw0NSA2OEw0NSA2OUw0NiA2OUw0NiA3MEw0NyA3MEw0NyA3MUw0OCA3MUw0OCA3MEw0OSA3MEw0OSA2OUw1MCA2OUw1MCA2N0w1MSA2N0w1MSA2M0w1MiA2M0w1MiA2NUw1MyA2NUw1MyA2M0w1MiA2M0w1MiA2MUw1MSA2MUw1MSA2MEw1MCA2MEw1MCA2MUw0OSA2MUw0OSA2MEw0OCA2MEw0OCA1OVpNNzEgNTlMNzEgNjBMNjggNjBMNjggNjFMNjcgNjFMNjcgNjJMNzEgNjJMNzEgNjFMNzIgNjFMNzIgNTlaTTE3IDYwTDE3IDYxTDE4IDYxTDE4IDYwWk0yMSA2MEwyMSA2MUwyMiA2MUwyMiA2MFpNMzUgNjBMMzUgNjJMMzQgNjJMMzQgNjNMMzggNjNMMzggNjVMMzYgNjVMMzYgNjZMMzcgNjZMMzcgNjdMMzggNjdMMzggNjlMMzcgNjlMMzcgNjhMMzUgNjhMMzUgNjdMMzMgNjdMMzMgNjVMMzIgNjVMMzIgNjdMMzEgNjdMMzEgNjhMMzIgNjhMMzIgNzBMMzMgNzBMMzMgNzFMMzQgNzFMMzQgNzJMMzUgNzJMMzUgNzNMMzYgNzNMMzYgNzBMMzggNzBMMzggNzFMMzcgNzFMMzcgNzNMMzggNzNMMzggNzJMMzkgNzJMMzkgNjhMNDIgNjhMNDIgNjdMNDMgNjdMNDMgNjZMNDIgNjZMNDIgNjdMNDEgNjdMNDEgNjVMNDIgNjVMNDIgNjRMNDEgNjRMNDEgNjNMNDAgNjNMNDAgNjJMMzcgNjJMMzcgNjFMMzYgNjFMMzYgNjBaTTEgNjFMMSA2MkwyIDYyTDIgNjFaTTMgNjFMMyA2Mkw0IDYyTDQgNjFaTTEwIDYxTDEwIDYzTDkgNjNMOSA2N0wxMSA2N0wxMSA2NkwxMiA2NkwxMiA2NEwxMSA2NEwxMSA2NUwxMCA2NUwxMCA2M0wxMSA2M0wxMSA2MVpNNDUgNjFMNDUgNjJMNDcgNjJMNDcgNjRMNDYgNjRMNDYgNjVMNDcgNjVMNDcgNjZMNDYgNjZMNDYgNjdMNDggNjdMNDggNjZMNDkgNjZMNDkgNjdMNTAgNjdMNTAgNjZMNDkgNjZMNDkgNjNMNDggNjNMNDggNjJMNDcgNjJMNDcgNjFaTTUwIDYxTDUwIDYzTDUxIDYzTDUxIDYxWk01OSA2MUw1OSA2Mkw2MCA2Mkw2MCA2MVpNODMgNjJMODMgNjNMODQgNjNMODQgNjJaTTg3IDYyTDg3IDYzTDg1IDYzTDg1IDY0TDg2IDY0TDg2IDY1TDg0IDY1TDg0IDY0TDgzIDY0TDgzIDY2TDgyIDY2TDgyIDY3TDgwIDY3TDgwIDY5TDgyIDY5TDgyIDY3TDg0IDY3TDg0IDY2TDg2IDY2TDg2IDY1TDg5IDY1TDg5IDYzTDkxIDYzTDkxIDYyWk0yIDYzTDIgNjRMMyA2NEwzIDYzWk0zOSA2M0wzOSA2NEw0MCA2NEw0MCA2M1pNNTUgNjNMNTUgNjRMNTYgNjRMNTYgNjVMNTQgNjVMNTQgNjZMNTYgNjZMNTYgNjdMNTggNjdMNTggNjhMNTkgNjhMNTkgNjdMNjAgNjdMNjAgNjZMNTkgNjZMNTkgNjVMNjAgNjVMNjAgNjRMNTkgNjRMNTkgNjVMNTggNjVMNTggNjZMNTYgNjZMNTYgNjVMNTcgNjVMNTcgNjRMNTggNjRMNTggNjNMNTcgNjNMNTcgNjRMNTYgNjRMNTYgNjNaTTc2IDYzTDc2IDY0TDc3IDY0TDc3IDYzWk02IDY0TDYgNjVMNyA2NUw3IDY0Wk02IDY2TDYgNjdMNyA2N0w3IDY2Wk0zOCA2NkwzOCA2N0w0MCA2N0w0MCA2NlpNMzIgNjdMMzIgNjhMMzMgNjhMMzMgNjlMMzQgNjlMMzQgNzBMMzYgNzBMMzYgNjlMMzUgNjlMMzUgNjhMMzMgNjhMMzMgNjdaTTkwIDY3TDkwIDY5TDkxIDY5TDkxIDY3Wk0yIDY4TDIgNjlMMyA2OUwzIDcwTDIgNzBMMiA3MkwzIDcyTDMgNzNMMSA3M0wxIDc0TDMgNzRMMyA3M0w0IDczTDQgNzFMNSA3MUw1IDcwTDQgNzBMNCA2OUwzIDY5TDMgNjhaTTE1IDY4TDE1IDcwTDE0IDcwTDE0IDY5TDEzIDY5TDEzIDcwTDE0IDcwTDE0IDcxTDEzIDcxTDEzIDcyTDE0IDcyTDE0IDczTDE1IDczTDE1IDc0TDE3IDc0TDE3IDc3TDE4IDc3TDE4IDc4TDE5IDc4TDE5IDc1TDE4IDc1TDE4IDc0TDE5IDc0TDE5IDczTDE4IDczTDE4IDcxTDE5IDcxTDE5IDcyTDIwIDcyTDIwIDc2TDIxIDc2TDIxIDc3TDIzIDc3TDIzIDc4TDI0IDc4TDI0IDc3TDI2IDc3TDI2IDc2TDI3IDc2TDI3IDc1TDI1IDc1TDI1IDc0TDIzIDc0TDIzIDczTDIxIDczTDIxIDcyTDIwIDcyTDIwIDcxTDE5IDcxTDE5IDY5TDE4IDY5TDE4IDcxTDE3IDcxTDE3IDczTDE1IDczTDE1IDcyTDE2IDcyTDE2IDY4Wk02IDY5TDYgNzBMNyA3MEw3IDY5Wk0yMCA2OUwyMCA3MEwyMSA3MEwyMSA2OVpNNTMgNjlMNTMgNzBMNTQgNzBMNTQgNjlaTTMgNzBMMyA3MUw0IDcxTDQgNzBaTTU3IDcwTDU3IDcxTDU4IDcxTDU4IDcwWk02MyA3MEw2MyA3MUw2NCA3MUw2NCA3Mkw2NSA3Mkw2NSA3MUw2NCA3MUw2NCA3MFpNNzEgNzBMNzEgNzFMNzIgNzFMNzIgNzJMNzMgNzJMNzMgNzFMNzIgNzFMNzIgNzBaTTc4IDcwTDc4IDcxTDc5IDcxTDc5IDczTDc4IDczTDc4IDc0TDgwIDc0TDgwIDcxTDgxIDcxTDgxIDcwWk0xNCA3MUwxNCA3MkwxNSA3MkwxNSA3MVpNNiA3Mkw2IDczTDcgNzNMNyA3MlpNOCA3Mkw4IDczTDkgNzNMOSA3MlpNMjcgNzJMMjcgNzNMMjggNzNMMjggNzJaTTkxIDcyTDkxIDczTDkzIDczTDkzIDcyWk0xNyA3M0wxNyA3NEwxOCA3NEwxOCA3M1pNNTcgNzNMNTcgNzRMNTYgNzRMNTYgNzVMNTcgNzVMNTcgNzZMNTkgNzZMNTkgNzVMNTcgNzVMNTcgNzRMNTggNzRMNTggNzNaTTYzIDczTDYzIDc0TDY0IDc0TDY0IDczWk03MCA3M0w3MCA3NEw3MSA3NEw3MSA3M1pNODQgNzNMODQgNzRMODUgNzRMODUgNzZMODQgNzZMODQgNzdMODEgNzdMODEgNzhMODUgNzhMODUgNzZMODYgNzZMODYgNzVMODggNzVMODggNzZMODcgNzZMODcgNzdMODYgNzdMODYgNzhMODcgNzhMODcgNzlMODggNzlMODggNzhMOTAgNzhMOTAgNzdMODggNzdMODggNzZMOTEgNzZMOTEgNzVMODggNzVMODggNzRMODUgNzRMODUgNzNaTTIxIDc0TDIxIDc2TDI1IDc2TDI1IDc1TDIyIDc1TDIyIDc0Wk0zOSA3NEwzOSA3NUw0MCA3NUw0MCA3Nkw0MSA3Nkw0MSA3N0w0MCA3N0w0MCA3OEw0MyA3OEw0MyA3N0w0NSA3N0w0NSA4MEw0NiA4MEw0NiA4MUw0NyA4MUw0NyA4MEw0NiA4MEw0NiA3OEw0NyA3OEw0NyA3N0w0NSA3N0w0NSA3Nkw0MSA3Nkw0MSA3NFpNNTIgNzRMNTIgNzVMNTMgNzVMNTMgNzdMNTYgNzdMNTYgNzZMNTQgNzZMNTQgNzVMNTUgNzVMNTUgNzRaTTM2IDc2TDM2IDc3TDM3IDc3TDM3IDc2Wk02NSA3Nkw2NSA3OEw2NCA3OEw2NCA3OUw2NSA3OUw2NSA3OEw2NiA3OEw2NiA3OUw2OCA3OUw2OCA4MEw2OSA4MEw2OSA3OUw2OCA3OUw2OCA3N0w2NiA3N0w2NiA3NlpNNzIgNzdMNzIgNzhMNzMgNzhMNzMgNzdaTTg3IDc3TDg3IDc4TDg4IDc4TDg4IDc3Wk0xMSA3OEwxMSA3OUwxMiA3OUwxMiA3OFpNMjkgNzhMMjkgNzlMMzAgNzlMMzAgNzhaTTYyIDc4TDYyIDc5TDYxIDc5TDYxIDgwTDYyIDgwTDYyIDc5TDYzIDc5TDYzIDc4Wk0zNSA3OUwzNSA4MEwzNiA4MEwzNiA3OVpNNzUgNzlMNzUgODFMNzQgODFMNzQgODJMNzMgODJMNzMgODRMNzQgODRMNzQgODJMNzUgODJMNzUgODFMNzYgODFMNzYgODBMNzcgODBMNzcgNzlaTTkyIDc5TDkyIDgxTDkzIDgxTDkzIDc5Wk0zMCA4MEwzMCA4MUwyOSA4MUwyOSA4MkwyOCA4MkwyOCA4M0wyOSA4M0wyOSA4NEwzMCA4NEwzMCA4M0wzMiA4M0wzMiA4NEwzMyA4NEwzMyA4NUwzNCA4NUwzNCA4NEwzMyA4NEwzMyA4M0wzMiA4M0wzMiA4MkwzMSA4MkwzMSA4MFpNMzggODBMMzggODFMMzcgODFMMzcgODJMNDEgODJMNDEgODFMMzkgODFMMzkgODBaTTggODFMOCA4Mkw5IDgyTDkgODFaTTgyIDgxTDgyIDgyTDgzIDgyTDgzIDgzTDg0IDgzTDg0IDgyTDgzIDgyTDgzIDgxWk04OCA4MUw4OCA4M0w4OSA4M0w4OSA4MVpNNDYgODJMNDYgODNMNDcgODNMNDcgODJaTTYyIDgyTDYyIDgzTDY0IDgzTDY0IDg0TDY2IDg0TDY2IDg2TDY1IDg2TDY1IDg1TDY0IDg1TDY0IDg2TDY1IDg2TDY1IDg5TDY4IDg5TDY4IDkxTDY5IDkxTDY5IDgzTDY4IDgzTDY4IDg0TDY3IDg0TDY3IDgzTDY2IDgzTDY2IDgyWk03OSA4Mkw3OSA4M0w4MCA4M0w4MCA4MlpNODYgODJMODYgODRMODcgODRMODcgODJaTTI0IDgzTDI0IDg0TDI1IDg0TDI1IDgzWk0xNiA4NEwxNiA4NUwxNyA4NUwxNyA4NFpNMjEgODRMMjEgODVMMjMgODVMMjMgODRaTTQyIDg0TDQyIDg1TDQzIDg1TDQzIDg0Wk02MiA4NEw2MiA4NUw2MyA4NUw2MyA4NFpNNzYgODRMNzYgODVMNzcgODVMNzcgODRaTTI5IDg1TDI5IDg4TDMyIDg4TDMyIDg1Wk01NyA4NUw1NyA4OEw2MCA4OEw2MCA4NVpNNzAgODVMNzAgODZMNzEgODZMNzEgODdMNzIgODdMNzIgODZMNzEgODZMNzEgODVaTTgyIDg1TDgyIDg2TDgzIDg2TDgzIDg1Wk04NSA4NUw4NSA4OEw4OCA4OEw4OCA4NVpNMzAgODZMMzAgODdMMzEgODdMMzEgODZaTTMzIDg2TDMzIDg4TDM0IDg4TDM0IDg2Wk01OCA4Nkw1OCA4N0w1OSA4N0w1OSA4NlpNNjcgODZMNjcgODdMNjYgODdMNjYgODhMNjggODhMNjggODZaTTg2IDg2TDg2IDg3TDg3IDg3TDg3IDg2Wk0xMSA4N0wxMSA4OEwxMiA4OEwxMiA4N1pNMjIgODdMMjIgOTFMMjMgOTFMMjMgODlMMjQgODlMMjQgODdaTTUwIDg3TDUwIDg4TDUxIDg4TDUxIDg3Wk0zNSA4OEwzNSA4OUwzNyA4OUwzNyA4OFpNNTcgODlMNTcgOTBMNTggOTBMNTggODlaTTgyIDg5TDgyIDkwTDgzIDkwTDgzIDg5Wk0xMiA5MEwxMiA5MUwxMyA5MUwxMyA5MFpNNDAgOTBMNDAgOTFMNDIgOTFMNDIgOTBaTTY2IDkwTDY2IDkxTDY3IDkxTDY3IDkwWk0yNSA5MUwyNSA5MkwyNiA5MkwyNiA5MVpNMjkgOTFMMjkgOTNMMzAgOTNMMzAgOTFaTTMzIDkxTDMzIDkzTDM0IDkzTDM0IDkxWk0zOCA5MUwzOCA5MkwzOSA5MkwzOSA5MVpNNjEgOTFMNjEgOTJMNjAgOTJMNjAgOTNMNjIgOTNMNjIgOTFaTTE1IDkyTDE1IDkzTDE2IDkzTDE2IDkyWk0xOCA5MkwxOCA5M0wxOSA5M0wxOSA5MlpNNDEgOTJMNDEgOTNMNDIgOTNMNDIgOTJaTTkyIDkyTDkyIDkzTDkzIDkzTDkzIDkyWk0wIDBMMCA3TDcgN0w3IDBaTTEgMUwxIDZMNiA2TDYgMVpNMiAyTDIgNUw1IDVMNSAyWk04NiAwTDg2IDdMOTMgN0w5MyAwWk04NyAxTDg3IDZMOTIgNkw5MiAxWk04OCAyTDg4IDVMOTEgNUw5MSAyWk0wIDg2TDAgOTNMNyA5M0w3IDg2Wk0xIDg3TDEgOTJMNiA5Mkw2IDg3Wk0yIDg4TDIgOTFMNSA5MUw1IDg4WiIgZmlsbD0iIzAwMDAwMCIvPjwvZz48L2c+PC9zdmc+Cg==	data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyIgPz4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+DQo8c3ZnIHdpZHRoPSIyMzciIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCAyMzcgODAiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCgk8ZGVzYz4wMDAwMDAxMjwvZGVzYz4NCgk8ZyBpZD0iYmFycyIgZmlsbD0icmdiKDAsMCwwKSIgc3Ryb2tlPSJub25lIj4NCgkJPHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjYiIGhlaWdodD0iODAiIC8+DQoJCTxyZWN0IHg9IjkiIHk9IjAiIHdpZHRoPSIzIiBoZWlnaHQ9IjgwIiAvPg0KCQk8cmVjdCB4PSIxOCIgeT0iMCIgd2lkdGg9IjkiIGhlaWdodD0iODAiIC8+DQoJCTxyZWN0IHg9IjMzIiB5PSIwIiB3aWR0aD0iNiIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iNDIiIHk9IjAiIHdpZHRoPSI2IiBoZWlnaHQ9IjgwIiAvPg0KCQk8cmVjdCB4PSI1NCIgeT0iMCIgd2lkdGg9IjYiIGhlaWdodD0iODAiIC8+DQoJCTxyZWN0IHg9IjY2IiB5PSIwIiB3aWR0aD0iNiIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iNzUiIHk9IjAiIHdpZHRoPSI2IiBoZWlnaHQ9IjgwIiAvPg0KCQk8cmVjdCB4PSI4NyIgeT0iMCIgd2lkdGg9IjYiIGhlaWdodD0iODAiIC8+DQoJCTxyZWN0IHg9Ijk5IiB5PSIwIiB3aWR0aD0iNiIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMTA4IiB5PSIwIiB3aWR0aD0iNiIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMTIwIiB5PSIwIiB3aWR0aD0iNiIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMTMyIiB5PSIwIiB3aWR0aD0iMyIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMTM4IiB5PSIwIiB3aWR0aD0iNiIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMTUwIiB5PSIwIiB3aWR0aD0iOSIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMTY1IiB5PSIwIiB3aWR0aD0iNiIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMTgwIiB5PSIwIiB3aWR0aD0iMyIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMTg2IiB5PSIwIiB3aWR0aD0iOSIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMTk4IiB5PSIwIiB3aWR0aD0iNiIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMjEzIiB5PSIwIiB3aWR0aD0iOSIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMjI1IiB5PSIwIiB3aWR0aD0iMyIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMjMxIiB5PSIwIiB3aWR0aD0iNiIgaGVpZ2h0PSI4MCIgLz4NCgk8L2c+DQo8L3N2Zz4NCg==
13	GPU RTX	7	Nvision	231313ewqew23232	247431.51	C-001-2025-1766714307036-3P7IBV3A	2025-12-23	250000	2026-07-31	4	1	1	\N	2	2025-12-26 01:58:55	2026-01-07 01:20:30	data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZlcnNpb249IjEuMSIgd2lkdGg9IjYwMCIgaGVpZ2h0PSI2MDAiIHZpZXdCb3g9IjAgMCA2MDAgNjAwIj48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iNjAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iI2ZmZmZmZiIvPjxnIHRyYW5zZm9ybT0ic2NhbGUoNi4xODYpIj48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyLDIpIj48cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik04IDBMOCAzTDkgM0w5IDBaTTExIDBMMTEgMkwxMCAyTDEwIDRMOSA0TDkgNUw4IDVMOCA5TDEwIDlMMTAgN0wxMSA3TDExIDRMMTIgNEwxMiA1TDE0IDVMMTQgN0wxMyA3TDEzIDZMMTIgNkwxMiA3TDEzIDdMMTMgOEwxNCA4TDE0IDlMMTUgOUwxNSA4TDE3IDhMMTcgOUwxNiA5TDE2IDEzTDEzIDEzTDEzIDlMMTIgOUwxMiA4TDExIDhMMTEgMTBMMTAgMTBMMTAgMTFMOSAxMUw5IDEyTDggMTJMOCAxMUw3IDExTDcgMTBMNiAxMEw2IDlMNyA5TDcgOEw2IDhMNiA5TDUgOUw1IDhMMiA4TDIgOUwxIDlMMSAxMEwyIDEwTDIgMTFMMCAxMUwwIDEyTDIgMTJMMiAxMUwzIDExTDMgMTBMNiAxMEw2IDExTDcgMTFMNyAxMkw1IDEyTDUgMTRMNiAxNEw2IDE1TDUgMTVMNSAxNkw0IDE2TDQgMTRMMyAxNEwzIDEzTDQgMTNMNCAxMkwzIDEyTDMgMTNMMSAxM0wxIDE0TDAgMTRMMCAxNkwxIDE2TDEgMTdMMyAxN0wzIDE4TDEgMThMMSAxOUwzIDE5TDMgMjFMMiAyMUwyIDIwTDEgMjBMMSAyMUwwIDIxTDAgMjJMMSAyMkwxIDIxTDIgMjFMMiAyM0wxIDIzTDEgMjVMMiAyNUwyIDI2TDQgMjZMNCAyN0w1IDI3TDUgMjZMNiAyNkw2IDI3TDcgMjdMNyAyOEw0IDI4TDQgMzNMMyAzM0wzIDMyTDEgMzJMMSAzM0wwIDMzTDAgMzRMMSAzNEwxIDM1TDAgMzVMMCAzN0wxIDM3TDEgMzZMMiAzNkwyIDM5TDEgMzlMMSA0MEwwIDQwTDAgNDFMMSA0MUwxIDQyTDAgNDJMMCA0M0wxIDQzTDEgNDVMMCA0NUwwIDQ2TDEgNDZMMSA0OEwyIDQ4TDIgNDdMMyA0N0wzIDQ4TDQgNDhMNCA0NkwyIDQ2TDIgNDVMMyA0NUwzIDQ0TDUgNDRMNSA0N0w3IDQ3TDcgNDZMOCA0Nkw4IDQ3TDkgNDdMOSA0OEwxMCA0OEwxMCA0OUwxMSA0OUwxMSA0OEwxMCA0OEwxMCA0N0wxMyA0N0wxMyA0OEwxMiA0OEwxMiA0OUwxMyA0OUwxMyA1MEwxMCA1MEwxMCA1MkwxMSA1MkwxMSA1NEwxMCA1NEwxMCA1NUw4IDU1TDggNTZMNiA1Nkw2IDU1TDcgNTVMNyA1NEw2IDU0TDYgNTVMNSA1NUw1IDU0TDQgNTRMNCA1M0w1IDUzTDUgNTJMNCA1Mkw0IDUwTDUgNTBMNSA1MUw3IDUxTDcgNTJMNiA1Mkw2IDUzTDggNTNMOCA1NEw5IDU0TDkgNTJMOCA1Mkw4IDUwTDkgNTBMOSA0OUw4IDQ5TDggNDhMNSA0OEw1IDQ5TDMgNDlMMyA1MEwyIDUwTDIgNDlMMCA0OUwwIDUxTDEgNTFMMSA1MkwwIDUyTDAgNTVMMSA1NUwxIDU2TDIgNTZMMiA1NUwzIDU1TDMgNTRMNCA1NEw0IDU3TDMgNTdMMyA1OEwxIDU4TDEgNTdMMCA1N0wwIDU4TDEgNThMMSA1OUwwIDU5TDAgNjBMMSA2MEwxIDYyTDAgNjJMMCA2NEwxIDY0TDEgNjNMMyA2M0wzIDY0TDIgNjRMMiA2NUwwIDY1TDAgNjdMMSA2N0wxIDY4TDMgNjhMMyA2OUwyIDY5TDIgNzBMMyA3MEwzIDc0TDEgNzRMMSA3M0wwIDczTDAgNzZMMSA3NkwxIDc3TDAgNzdMMCA4MkwxIDgyTDEgODBMMiA4MEwyIDgxTDMgODFMMyA4MEw0IDgwTDQgODFMNSA4MUw1IDgwTDYgODBMNiA4MUw4IDgxTDggODNMNyA4M0w3IDgyTDYgODJMNiA4M0w1IDgzTDUgODJMNCA4Mkw0IDgzTDMgODNMMyA4NEwyIDg0TDIgODNMMCA4M0wwIDg0TDEgODRMMSA4NUwzIDg1TDMgODRMNiA4NEw2IDg1TDcgODVMNyA4NEw4IDg0TDggODZMOSA4Nkw5IDg1TDEyIDg1TDEyIDgzTDExIDgzTDExIDg0TDkgODRMOSA4M0wxMCA4M0wxMCA4MkwxMiA4MkwxMiA4MUwxMCA4MUwxMCA3OUwxMiA3OUwxMiA4MEwxMyA4MEwxMyA4NEwxNSA4NEwxNSA4NUwxMyA4NUwxMyA4NkwxMSA4NkwxMSA4N0wxMCA4N0wxMCA4OUw5IDg5TDkgODhMOCA4OEw4IDkxTDkgOTFMOSA5MkwxMiA5MkwxMiA5M0wxNCA5M0wxNCA5MUwxMyA5MUwxMyA5MEwxMSA5MEwxMSA4OEwxMyA4OEwxMyA4OUwxNCA4OUwxNCA5MEwxNSA5MEwxNSA4OEwxNCA4OEwxNCA4N0wxNSA4N0wxNSA4NUwxNiA4NUwxNiA4NEwxNSA4NEwxNSA4M0wxNiA4M0wxNiA4MkwxNyA4MkwxNyA4MUwxNiA4MUwxNiA4MEwxNSA4MEwxNSA3OUwxNiA3OUwxNiA3OEwxNyA3OEwxNyA3OUwxOCA3OUwxOCA4MkwxOSA4MkwxOSA4MEwyMCA4MEwyMCA4MUwyMSA4MUwyMSA4MkwyMCA4MkwyMCA4M0wyMSA4M0wyMSA4NEwyMiA4NEwyMiA4NkwyMyA4NkwyMyA4NUwyNCA4NUwyNCA4N0wyMiA4N0wyMiA4OEwyMSA4OEwyMSA4NUwyMCA4NUwyMCA4NEwxOSA4NEwxOSA4NUwyMCA4NUwyMCA4OUwxOSA4OUwxOSA4NkwxOCA4NkwxOCA4NUwxNyA4NUwxNyA4NkwxOCA4NkwxOCA4N0wxNyA4N0wxNyA4OEwxOCA4OEwxOCA4OUwxNiA4OUwxNiA5MUwxNSA5MUwxNSA5MkwxNiA5MkwxNiA5MUwxNyA5MUwxNyA5MkwxOCA5MkwxOCA5M0wxOSA5M0wxOSA5MkwyMCA5MkwyMCA5M0wyNCA5M0wyNCA5MkwyMyA5MkwyMyA5MUwyNSA5MUwyNSA5M0wyNyA5M0wyNyA5MkwyNiA5MkwyNiA5MUwyNyA5MUwyNyA5MEwyNiA5MEwyNiA5MUwyNSA5MUwyNSA5MEwyNCA5MEwyNCA4OUwyNyA4OUwyNyA4OEwyOCA4OEwyOCA4OUwyOSA4OUwyOSA5MEwyOCA5MEwyOCA5MUwyOSA5MUwyOSA5MEwzMCA5MEwzMCA5MUwzMSA5MUwzMSA5MkwyOSA5MkwyOSA5M0wzNCA5M0wzNCA5MUwzMSA5MUwzMSA5MEwzMyA5MEwzMyA4NkwzNiA4NkwzNiA4N0wzNSA4N0wzNSA4OEwzNCA4OEwzNCA4OUwzNSA4OUwzNSA4OEwzNiA4OEwzNiA4N0wzNyA4N0wzNyA4OEwzOSA4OEwzOSA5MEw0MSA5MEw0MSA4OUw0MyA4OUw0MyA5MEw0MiA5MEw0MiA5MUwzOCA5MUwzOCA4OUwzNiA4OUwzNiA5M0wzNyA5M0wzNyA5MkwzOCA5MkwzOCA5M0wzOSA5M0wzOSA5Mkw0MCA5Mkw0MCA5M0w0MiA5M0w0MiA5Mkw0NCA5Mkw0NCA5M0w0NSA5M0w0NSA5Mkw0NiA5Mkw0NiA5M0w0NyA5M0w0NyA5MEw0OSA5MEw0OSA5MUw1MCA5MUw1MCA4OEw1MSA4OEw1MSA4Nkw1MiA4Nkw1MiA4OUw1MSA4OUw1MSA5MEw1MyA5MEw1MyA5Mkw1NCA5Mkw1NCA5M0w1OSA5M0w1OSA5Mkw2MSA5Mkw2MSA5M0w2MiA5M0w2MiA5Mkw2MyA5Mkw2MyA5M0w2NCA5M0w2NCA5Mkw2NSA5Mkw2NSA5MUw2NiA5MUw2NiA5M0w2NyA5M0w2NyA5Mkw2OCA5Mkw2OCA5M0w2OSA5M0w2OSA5Mkw3MCA5Mkw3MCA5M0w3MSA5M0w3MSA5Mkw3MyA5Mkw3MyA5M0w3NiA5M0w3NiA5Mkw3MyA5Mkw3MyA5MUw3OCA5MUw3OCA5Mkw3NyA5Mkw3NyA5M0w3OSA5M0w3OSA5MUw4MCA5MUw4MCA5Mkw4MSA5Mkw4MSA5M0w4MiA5M0w4MiA5MEw4MyA5MEw4MyA5MUw4NCA5MUw4NCA5Mkw4MyA5Mkw4MyA5M0w4NSA5M0w4NSA5MUw4NyA5MUw4NyA5M0w4OCA5M0w4OCA5MUw4NyA5MUw4NyA5MEw4OCA5MEw4OCA4OUw4OSA4OUw4OSA5M0w5MCA5M0w5MCA5Mkw5MSA5Mkw5MSA5M0w5MiA5M0w5MiA5Mkw5MSA5Mkw5MSA4OEw5MiA4OEw5MiA4OUw5MyA4OUw5MyA4OEw5MiA4OEw5MiA4Nkw5MSA4Nkw5MSA4NUw5MiA4NUw5MiA4Mkw5MyA4Mkw5MyA4MUw5MSA4MUw5MSA4Mkw4OSA4Mkw4OSA4NEw4NiA4NEw4NiA4Mkw4NyA4Mkw4NyA4M0w4OCA4M0w4OCA4Mkw4NyA4Mkw4NyA4MUw5MCA4MUw5MCA4MEw5MSA4MEw5MSA3OUw5MiA3OUw5MiA4MEw5MyA4MEw5MyA3OUw5MiA3OUw5MiA3N0w5MCA3N0w5MCA3Nkw5MSA3Nkw5MSA3NUw5MiA3NUw5MiA3NEw5MSA3NEw5MSA3M0w5MyA3M0w5MyA3MUw5MiA3MUw5MiA3MEw5MyA3MEw5MyA2OEw5MiA2OEw5MiA2N0w5MCA2N0w5MCA2Nkw5MyA2Nkw5MyA2NUw5MCA2NUw5MCA2Nkw4OCA2Nkw4OCA2NUw4OSA2NUw4OSA2NEw5MyA2NEw5MyA2M0w5MSA2M0w5MSA2Mkw5MyA2Mkw5MyA2MUw5MSA2MUw5MSA2MEw5MyA2MEw5MyA1OUw5MiA1OUw5MiA1OEw5MSA1OEw5MSA1N0w5MCA1N0w5MCA1Nkw5MyA1Nkw5MyA1NUw5MiA1NUw5MiA1NEw5MyA1NEw5MyA1M0w5MiA1M0w5MiA1NEw5MSA1NEw5MSA1M0w5MCA1M0w5MCA1Mkw5MiA1Mkw5MiA1MUw5MCA1MUw5MCA1Mkw4OSA1Mkw4OSA1MUw4OCA1MUw4OCA1MEw4OSA1MEw4OSA0OUw4NyA0OUw4NyA0OEw4OCA0OEw4OCA0N0w4OSA0N0w4OSA0OEw5MSA0OEw5MSA0N0w5MiA0N0w5MiA0OUw5MCA0OUw5MCA1MEw5MyA1MEw5MyA0N0w5MiA0N0w5MiA0NUw5MyA0NUw5MyA0M0w5MiA0M0w5MiA0NUw5MSA0NUw5MSA0M0w5MCA0M0w5MCA0Mkw5MSA0Mkw5MSA0MEw5MiA0MEw5MiAzOEw5MyAzOEw5MyAzN0w5MiAzN0w5MiAzNkw5MSAzNkw5MSAzNUw5MiAzNUw5MiAzNEw5MyAzNEw5MyAzM0w5MiAzM0w5MiAzNEw5MSAzNEw5MSAzM0w5MCAzM0w5MCAzMkw5MyAzMkw5MyAzMUw5MSAzMUw5MSAzMEw5MyAzMEw5MyAyOUw5MiAyOUw5MiAyOEw5MSAyOEw5MSAyN0w5MiAyN0w5MiAyNkw5MyAyNkw5MyAyM0w5MiAyM0w5MiAyNkw5MSAyNkw5MSAyNUw5MCAyNUw5MCAyNkw4OSAyNkw4OSAyNUw4OCAyNUw4OCAyNkw4OSAyNkw4OSAyOEw4NyAyOEw4NyAyN0w4NiAyN0w4NiAyNkw4NyAyNkw4NyAyNUw4NiAyNUw4NiAyNkw4NSAyNkw4NSAyNUw4NCAyNUw4NCAyNEw4NyAyNEw4NyAyM0w4OSAyM0w4OSAyNEw5MSAyNEw5MSAyMUw5MCAyMUw5MCAyMEw5MSAyMEw5MSAxOUw5MiAxOUw5MiAxN0w5MyAxN0w5MyAxNkw5MiAxNkw5MiAxNEw5MyAxNEw5MyAxM0w5MSAxM0w5MSAxNUw5MCAxNUw5MCAxM0w4OSAxM0w4OSAxMkw5MSAxMkw5MSAxMUw5MiAxMUw5MiAxMkw5MyAxMkw5MyAxMUw5MiAxMUw5MiAxMEw5MyAxMEw5MyA4TDkwIDhMOTAgOUw4OCA5TDg4IDhMODUgOEw4NSA2TDg0IDZMODQgM0w4NSAzTDg1IDFMODQgMUw4NCAwTDgzIDBMODMgMkw4NCAyTDg0IDNMODMgM0w4MyA0TDgyIDRMODIgM0w4MSAzTDgxIDJMODIgMkw4MiAxTDgxIDFMODEgMkw3OCAyTDc4IDFMNzcgMUw3NyAyTDc2IDJMNzYgMEw3NCAwTDc0IDFMNzMgMUw3MyAwTDcyIDBMNzIgMkw3NCAyTDc0IDNMNzUgM0w3NSA0TDc4IDRMNzggNUw3OSA1TDc5IDZMNzggNkw3OCA4TDgwIDhMODAgN0w4MSA3TDgxIDhMODIgOEw4MiA3TDgzIDdMODMgNkw4NCA2TDg0IDhMODMgOEw4MyA5TDgxIDlMODEgMTBMODAgMTBMODAgMTFMNzggMTFMNzggMTBMNzkgMTBMNzkgOUw3OCA5TDc4IDEwTDc3IDEwTDc3IDVMNzQgNUw3NCA3TDc1IDdMNzUgNkw3NiA2TDc2IDhMNzUgOEw3NSAxMUw3NCAxMUw3NCAxMEw3MyAxMEw3MyAxMUw2OSAxMUw2OSAxMEw3MCAxMEw3MCA5TDY5IDlMNjkgOEw3MiA4TDcyIDlMNzEgOUw3MSAxMEw3MiAxMEw3MiA5TDczIDlMNzMgNkw3MiA2TDcyIDdMNzEgN0w3MSA2TDcwIDZMNzAgN0w2OSA3TDY5IDZMNjggNkw2OCA1TDY3IDVMNjcgM0w2OCAzTDY4IDRMNjkgNEw2OSA1TDcwIDVMNzAgNEw3MSA0TDcxIDVMNzIgNUw3MiA0TDcxIDRMNzEgM0w2OCAzTDY4IDJMNzEgMkw3MSAxTDcwIDFMNzAgMEw2OCAwTDY4IDFMNjcgMUw2NyAwTDY2IDBMNjYgMUw2MyAxTDYzIDBMNjIgMEw2MiAxTDYxIDFMNjEgMkw2MCAyTDYwIDNMNTcgM0w1NyAxTDU4IDFMNTggMEw1NyAwTDU3IDFMNTYgMUw1NiAzTDU1IDNMNTUgMUw1NCAxTDU0IDBMNTAgMEw1MCAxTDQ5IDFMNDkgMEw0OCAwTDQ4IDFMNDkgMUw0OSAyTDQ4IDJMNDggNUw0NyA1TDQ3IDZMNDYgNkw0NiA1TDQ1IDVMNDUgNEw0NCA0TDQ0IDVMNDIgNUw0MiAyTDQzIDJMNDMgMUw0MSAxTDQxIDBMMzUgMEwzNSAxTDM0IDFMMzQgMEwzMyAwTDMzIDFMMzQgMUwzNCAyTDM4IDJMMzggMUw0MCAxTDQwIDJMNDEgMkw0MSAzTDQwIDNMNDAgNUw0MiA1TDQyIDdMNDEgN0w0MSA2TDQwIDZMNDAgOEw0NCA4TDQ0IDlMNDUgOUw0NSAxMUw0NCAxMUw0NCAxMkw0MiAxMkw0MiAxMUw0MyAxMUw0MyA5TDQyIDlMNDIgMTFMNDEgMTFMNDEgOUw0MCA5TDQwIDEyTDQyIDEyTDQyIDE0TDQ1IDE0TDQ1IDEzTDQ0IDEzTDQ0IDEyTDQ2IDEyTDQ2IDExTDQ3IDExTDQ3IDEyTDQ4IDEyTDQ4IDEwTDQ5IDEwTDQ5IDE0TDQ3IDE0TDQ3IDEzTDQ2IDEzTDQ2IDE1TDQyIDE1TDQyIDE2TDQxIDE2TDQxIDE3TDQ1IDE3TDQ1IDE4TDQ2IDE4TDQ2IDIwTDQ1IDIwTDQ1IDIxTDQ0IDIxTDQ0IDIwTDQzIDIwTDQzIDE5TDQxIDE5TDQxIDE4TDQwIDE4TDQwIDE2TDM5IDE2TDM5IDE0TDM3IDE0TDM3IDEyTDM2IDEyTDM2IDEzTDM0IDEzTDM0IDE0TDMyIDE0TDMyIDE1TDMzIDE1TDMzIDE2TDMxIDE2TDMxIDE1TDI5IDE1TDI5IDIwTDI4IDIwTDI4IDIxTDI1IDIxTDI1IDIyTDI2IDIyTDI2IDIzTDI1IDIzTDI1IDI1TDIzIDI1TDIzIDI2TDIyIDI2TDIyIDI4TDIzIDI4TDIzIDI5TDIxIDI5TDIxIDI2TDE5IDI2TDE5IDI3TDIwIDI3TDIwIDI5TDE4IDI5TDE4IDI3TDE3IDI3TDE3IDI4TDE2IDI4TDE2IDI5TDE0IDI5TDE0IDI4TDE1IDI4TDE1IDI2TDE2IDI2TDE2IDI1TDE1IDI1TDE1IDI0TDE2IDI0TDE2IDIzTDE3IDIzTDE3IDIyTDE4IDIyTDE4IDIzTDE5IDIzTDE5IDIyTDIxIDIyTDIxIDIxTDIyIDIxTDIyIDIyTDI0IDIyTDI0IDIxTDIzIDIxTDIzIDIwTDIyIDIwTDIyIDE5TDE5IDE5TDE5IDIwTDE4IDIwTDE4IDE5TDE3IDE5TDE3IDE4TDE2IDE4TDE2IDE2TDE1IDE2TDE1IDE1TDE3IDE1TDE3IDE0TDE2IDE0TDE2IDEzTDE4IDEzTDE4IDE2TDE3IDE2TDE3IDE3TDE4IDE3TDE4IDE4TDE5IDE4TDE5IDE2TDIwIDE2TDIwIDE3TDIxIDE3TDIxIDE4TDIyIDE4TDIyIDE3TDIxIDE3TDIxIDE2TDIyIDE2TDIyIDE0TDIzIDE0TDIzIDEzTDIyIDEzTDIyIDEyTDI0IDEyTDI0IDExTDIzIDExTDIzIDlMMjIgOUwyMiAxMEwyMSAxMEwyMSA5TDIwIDlMMjAgMTBMMTkgMTBMMTkgMTFMMTggMTFMMTggOUwxOSA5TDE5IDhMMjAgOEwyMCA3TDIxIDdMMjEgNkwyMCA2TDIwIDVMMjIgNUwyMiA0TDIzIDRMMjMgNUwyNCA1TDI0IDJMMjYgMkwyNiAzTDI1IDNMMjUgNkwyNCA2TDI0IDdMMjUgN0wyNSA4TDI0IDhMMjQgOUwyNSA5TDI1IDEwTDI2IDEwTDI2IDExTDI1IDExTDI1IDEzTDI0IDEzTDI0IDE1TDIzIDE1TDIzIDE4TDI0IDE4TDI0IDIwTDI1IDIwTDI1IDE5TDI2IDE5TDI2IDE4TDI3IDE4TDI3IDE5TDI4IDE5TDI4IDE1TDI1IDE1TDI1IDEzTDI4IDEzTDI4IDE0TDMwIDE0TDMwIDEyTDMxIDEyTDMxIDEzTDMyIDEzTDMyIDEyTDMxIDEyTDMxIDExTDM0IDExTDM0IDEyTDM1IDEyTDM1IDExTDM0IDExTDM0IDEwTDM1IDEwTDM1IDZMMzQgNkwzNCA4TDMzIDhMMzMgNUwzNCA1TDM0IDNMMzMgM0wzMyA0TDMyIDRMMzIgMkwzMSAyTDMxIDFMMzIgMUwzMiAwTDMxIDBMMzEgMUwzMCAxTDMwIDBMMjkgMEwyOSAxTDMwIDFMMzAgMkwzMSAyTDMxIDNMMjkgM0wyOSAyTDI3IDJMMjcgMUwyOCAxTDI4IDBMMjYgMEwyNiAxTDI0IDFMMjQgMkwyMyAyTDIzIDNMMjEgM0wyMSAxTDIwIDFMMjAgMEwxNiAwTDE2IDFMMTUgMUwxNSAwTDEzIDBMMTMgMUwxMiAxTDEyIDBaTTQ1IDBMNDUgMUw0NCAxTDQ0IDNMNDUgM0w0NSAyTDQ3IDJMNDcgMUw0NiAxTDQ2IDBaTTc5IDBMNzkgMUw4MCAxTDgwIDBaTTEzIDFMMTMgMkwxNCAyTDE0IDFaTTE2IDFMMTYgMkwxNyAyTDE3IDNMMTUgM0wxNSA0TDE0IDRMMTQgM0wxMyAzTDEzIDRMMTQgNEwxNCA1TDE2IDVMMTYgNEwxNyA0TDE3IDhMMTggOEwxOCA1TDIwIDVMMjAgNEwyMSA0TDIxIDNMMjAgM0wyMCAxTDE5IDFMMTkgM0wyMCAzTDIwIDRMMTcgNEwxNyAzTDE4IDNMMTggMVpNNTEgMUw1MSAyTDUzIDJMNTMgM0w1MSAzTDUxIDRMNTAgNEw1MCAyTDQ5IDJMNDkgN0w1MCA3TDUwIDlMNTEgOUw1MSAxMEw1MiAxMEw1MiAxMUw1MSAxMUw1MSAxMkw1MCAxMkw1MCAxM0w1MSAxM0w1MSAxMkw1MiAxMkw1MiAxM0w1NCAxM0w1NCAxNEw0OSAxNEw0OSAxNkw0OCAxNkw0OCAxNUw0NiAxNUw0NiAxNkw0NyAxNkw0NyAxN0w0NiAxN0w0NiAxOEw0OCAxOEw0OCAxN0w0OSAxN0w0OSAxNkw1MCAxNkw1MCAxNUw1MSAxNUw1MSAxN0w1MCAxN0w1MCAxOEw0OSAxOEw0OSAxOUw0NyAxOUw0NyAyMUw0NSAyMUw0NSAyNEw0NiAyNEw0NiAyNUw0NCAyNUw0NCAyNEw0MyAyNEw0MyAyM0w0NCAyM0w0NCAyMUw0MiAyMUw0MiAyMEw0MSAyMEw0MSAyMUw0MiAyMUw0MiAyMkw0MSAyMkw0MSAyM0wzOCAyM0wzOCAyMkw0MCAyMkw0MCAyMEwzOCAyMEwzOCAxOUwzOSAxOUwzOSAxNkwzOCAxNkwzOCAxNUwzNCAxNUwzNCAxOEwzMyAxOEwzMyAxN0wzMSAxN0wzMSAxNkwzMCAxNkwzMCAxOEwzMiAxOEwzMiAxOUwzMCAxOUwzMCAyMEwyOSAyMEwyOSAyMUwzMCAyMUwzMCAyMEwzMiAyMEwzMiAyMUwzMyAyMUwzMyAyMkwzMiAyMkwzMiAyNEwzMSAyNEwzMSAyNUwzMCAyNUwzMCAyOEwzMiAyOEwzMiAyNkwzMyAyNkwzMyAyOEwzNCAyOEwzNCAzMEwzMyAzMEwzMyAzMkwzNCAzMkwzNCAzM0wzMyAzM0wzMyAzNEwzNCAzNEwzNCAzNUwzMyAzNUwzMyAzNkwzMiAzNkwzMiAzNUwzMSAzNUwzMSAzN0wyOCAzN0wyOCAzNkwyOSAzNkwyOSAzNUwzMCAzNUwzMCAzNEwyNyAzNEwyNyAzNUwyOCAzNUwyOCAzNkwyNiAzNkwyNiAzM0wyNyAzM0wyNyAzMkwyOCAzMkwyOCAzMUwyNyAzMUwyNyAzMEwyOCAzMEwyOCAyN0wyOSAyN0wyOSAyNkwyOCAyNkwyOCAyN0wyNyAyN0wyNyAyNUwyOCAyNUwyOCAyNEwyOSAyNEwyOSAyM0wzMSAyM0wzMSAyMkwyNyAyMkwyNyAyM0wyNiAyM0wyNiAyNEwyNyAyNEwyNyAyNUwyNiAyNUwyNiAzMEwyNSAzMEwyNSAzMUwyMyAzMUwyMyAzMEwyMCAzMEwyMCAzMUwxOSAzMUwxOSAzMEwxOCAzMEwxOCAyOUwxNyAyOUwxNyAzMUwxNiAzMUwxNiAzMEwxNCAzMEwxNCAyOUwxMyAyOUwxMyAyN0wxNCAyN0wxNCAyNkwxNSAyNkwxNSAyNUwxNCAyNUwxNCAyNEwxNSAyNEwxNSAyM0wxNiAyM0wxNiAyMkwxNyAyMkwxNyAyMUwxOCAyMUwxOCAyMkwxOSAyMkwxOSAyMUwyMSAyMUwyMSAyMEwxOSAyMEwxOSAyMUwxOCAyMUwxOCAyMEwxNiAyMEwxNiAxOEwxNSAxOEwxNSAxOUwxNCAxOUwxNCAxNUwxNSAxNUwxNSAxNEwxNCAxNEwxNCAxNUwxMyAxNUwxMyAxM0wxMiAxM0wxMiAxMkwxMSAxMkwxMSAxM0w2IDEzTDYgMTRMNyAxNEw3IDE1TDYgMTVMNiAxNkw3IDE2TDcgMTdMNiAxN0w2IDE4TDUgMThMNSAxN0w0IDE3TDQgMThMMyAxOEwzIDE5TDQgMTlMNCAxOEw1IDE4TDUgMTlMNiAxOUw2IDIwTDcgMjBMNyAxOUw4IDE5TDggMjJMNyAyMkw3IDIxTDYgMjFMNiAyMkw0IDIyTDQgMjFMNSAyMUw1IDIwTDQgMjBMNCAyMUwzIDIxTDMgMjJMNCAyMkw0IDI0TDMgMjRMMyAyM0wyIDIzTDIgMjRMMyAyNEwzIDI1TDYgMjVMNiAyNkw5IDI2TDkgMjdMOCAyN0w4IDI4TDEwIDI4TDEwIDI2TDExIDI2TDExIDI3TDEyIDI3TDEyIDI5TDExIDI5TDExIDMwTDEyIDMwTDEyIDMxTDE0IDMxTDE0IDMzTDE1IDMzTDE1IDM0TDE0IDM0TDE0IDM1TDE2IDM1TDE2IDMzTDE1IDMzTDE1IDMyTDE3IDMyTDE3IDMxTDE5IDMxTDE5IDMzTDE4IDMzTDE4IDM1TDE5IDM1TDE5IDM2TDE4IDM2TDE4IDM4TDE3IDM4TDE3IDM2TDE2IDM2TDE2IDM3TDEzIDM3TDEzIDM4TDE2IDM4TDE2IDQwTDE1IDQwTDE1IDQxTDEzIDQxTDEzIDQwTDEyIDQwTDEyIDM5TDExIDM5TDExIDM3TDggMzdMOCAzOEwxMCAzOEwxMCAzOUw4IDM5TDggNDBMOSA0MEw5IDQxTDEwIDQxTDEwIDQyTDExIDQyTDExIDQxTDEzIDQxTDEzIDQyTDEyIDQyTDEyIDQzTDExIDQzTDExIDQ0TDEyIDQ0TDEyIDQ1TDEwIDQ1TDEwIDQ2TDE2IDQ2TDE2IDQ1TDE4IDQ1TDE4IDQ0TDE5IDQ0TDE5IDQ4TDIwIDQ4TDIwIDQ1TDIxIDQ1TDIxIDQ2TDIzIDQ2TDIzIDQ3TDIxIDQ3TDIxIDQ5TDE5IDQ5TDE5IDUwTDIwIDUwTDIwIDUxTDE5IDUxTDE5IDUyTDIwIDUyTDIwIDUzTDIxIDUzTDIxIDU0TDE5IDU0TDE5IDUzTDE2IDUzTDE2IDU0TDE1IDU0TDE1IDU1TDE0IDU1TDE0IDU0TDEyIDU0TDEyIDU2TDEzIDU2TDEzIDU1TDE0IDU1TDE0IDU4TDEzIDU4TDEzIDU5TDExIDU5TDExIDYwTDEwIDYwTDEwIDU5TDkgNTlMOSA2MUw2IDYxTDYgNjJMNyA2Mkw3IDYzTDUgNjNMNSA2NEw0IDY0TDQgNjZMNSA2Nkw1IDY0TDcgNjRMNyA2NUw2IDY1TDYgNjZMNyA2Nkw3IDY1TDkgNjVMOSA2Nkw4IDY2TDggNjdMNiA2N0w2IDY4TDQgNjhMNCA2N0wzIDY3TDMgNjhMNCA2OEw0IDY5TDMgNjlMMyA3MEw0IDcwTDQgNzFMNiA3MUw2IDcyTDggNzJMOCA3M0w5IDczTDkgNzFMMTAgNzFMMTAgNzJMMTMgNzJMMTMgNzNMMTQgNzNMMTQgNzdMMTcgNzdMMTcgNzhMMTggNzhMMTggNzlMMjAgNzlMMjAgODBMMjEgODBMMjEgODFMMjIgODFMMjIgODBMMjMgODBMMjMgODNMMjIgODNMMjIgODJMMjEgODJMMjEgODNMMjIgODNMMjIgODRMMjcgODRMMjcgODVMMjUgODVMMjUgODhMMjcgODhMMjcgODdMMjggODdMMjggODRMMzAgODRMMzAgODNMMzEgODNMMzEgNzlMMzAgNzlMMzAgODNMMjkgODNMMjkgNzhMMzAgNzhMMzAgNzdMMzEgNzdMMzEgNzhMMzMgNzhMMzMgNzZMMzAgNzZMMzAgNzRMMzEgNzRMMzEgNzNMMzIgNzNMMzIgNzRMMzMgNzRMMzMgNzVMMzUgNzVMMzUgNzZMMzYgNzZMMzYgNzhMMzUgNzhMMzUgNzdMMzQgNzdMMzQgNzhMMzUgNzhMMzUgNzlMMzQgNzlMMzQgODJMMzYgODJMMzYgODNMMzQgODNMMzQgODRMMzMgODRMMzMgODVMMzQgODVMMzQgODRMMzUgODRMMzUgODVMMzcgODVMMzcgODRMMzggODRMMzggODNMNDAgODNMNDAgODVMMzkgODVMMzkgODZMNDAgODZMNDAgODVMNDIgODVMNDIgODdMNDEgODdMNDEgODhMNDAgODhMNDAgODlMNDEgODlMNDEgODhMNDMgODhMNDMgODlMNDQgODlMNDQgOTFMNDYgOTFMNDYgODlMNDkgODlMNDkgODhMNTAgODhMNTAgODZMNDkgODZMNDkgODVMNDggODVMNDggODRMNDkgODRMNDkgODJMNTAgODJMNTAgODRMNTEgODRMNTEgODVMNTIgODVMNTIgODRMNTQgODRMNTQgODVMNTUgODVMNTUgODZMNTYgODZMNTYgODVMNTUgODVMNTUgODRMNTggODRMNTggODNMNTkgODNMNTkgODJMNjEgODJMNjEgODNMNjAgODNMNjAgODRMNjIgODRMNjIgODJMNjEgODJMNjEgODFMNTkgODFMNTkgODJMNTggODJMNTggODFMNTYgODFMNTYgODBMNTUgODBMNTUgNzlMNTYgNzlMNTYgNzdMNTcgNzdMNTcgODBMNjUgODBMNjUgNzhMNjYgNzhMNjYgNzlMNjggNzlMNjggODBMNjYgODBMNjYgODFMNjQgODFMNjQgODNMNjUgODNMNjUgODRMNjQgODRMNjQgODdMNjMgODdMNjMgODhMNjQgODhMNjQgODlMNjIgODlMNjIgODdMNjEgODdMNjEgODlMNjIgODlMNjIgOTBMNjEgOTBMNjEgOTJMNjIgOTJMNjIgOTFMNjQgOTFMNjQgOTBMNjYgOTBMNjYgOTFMNjcgOTFMNjcgOTBMNjkgOTBMNjkgOTFMNjggOTFMNjggOTJMNjkgOTJMNjkgOTFMNzMgOTFMNzMgOTBMNzQgOTBMNzQgODhMNzYgODhMNzYgODlMNzcgODlMNzcgOTBMNzkgOTBMNzkgODlMODIgODlMODIgODhMODMgODhMODMgOTBMODQgOTBMODQgOTFMODUgOTFMODUgODlMODQgODlMODQgODhMODMgODhMODMgODdMODIgODdMODIgODZMODEgODZMODEgODNMODIgODNMODIgODRMODMgODRMODMgODNMODQgODNMODQgODJMODYgODJMODYgODFMODcgODFMODcgODBMODYgODBMODYgNzhMODUgNzhMODUgNzdMODcgNzdMODcgNzZMODYgNzZMODYgNzVMODUgNzVMODUgNzZMODIgNzZMODIgNzRMODMgNzRMODMgNzVMODQgNzVMODQgNzRMODcgNzRMODcgNzVMODggNzVMODggNzZMOTAgNzZMOTAgNzNMOTEgNzNMOTEgNzJMOTIgNzJMOTIgNzFMOTEgNzFMOTEgNzJMOTAgNzJMOTAgNzNMODcgNzNMODcgNzFMOTAgNzFMOTAgNjlMOTEgNjlMOTEgNjhMOTAgNjhMOTAgNjdMODkgNjdMODkgNjhMOTAgNjhMOTAgNjlMODcgNjlMODcgNjhMODggNjhMODggNjdMODcgNjdMODcgNjZMODYgNjZMODYgNjVMODcgNjVMODcgNjRMODYgNjRMODYgNjNMODUgNjNMODUgNjRMODEgNjRMODEgNjVMODUgNjVMODUgNjdMODcgNjdMODcgNjhMODYgNjhMODYgNjlMODUgNjlMODUgNjhMODQgNjhMODQgNjZMODMgNjZMODMgNjdMODIgNjdMODIgNjZMODEgNjZMODEgNjdMODAgNjdMODAgNjRMNzkgNjRMNzkgNjNMNzggNjNMNzggNjRMNzcgNjRMNzcgNjVMNzUgNjVMNzUgNjZMNzYgNjZMNzYgNjdMNzcgNjdMNzcgNjZMNzkgNjZMNzkgNjdMNzggNjdMNzggNjlMNzcgNjlMNzcgNjhMNzYgNjhMNzYgNzBMNzggNzBMNzggNzFMNzkgNzFMNzkgNzJMNzggNzJMNzggNzNMNzYgNzNMNzYgNzRMNzggNzRMNzggNzVMNzcgNzVMNzcgNzhMNzggNzhMNzggNzlMNzcgNzlMNzcgODFMNzYgODFMNzYgODZMNzUgODZMNzUgODRMNzQgODRMNzQgODVMNzMgODVMNzMgODZMNzQgODZMNzQgODdMNzMgODdMNzMgODhMNzEgODhMNzEgODdMNzIgODdMNzIgODZMNzEgODZMNzEgODdMNzAgODdMNzAgODZMNjggODZMNjggODdMNjcgODdMNjcgODZMNjYgODZMNjYgODRMNjcgODRMNjcgODVMNjkgODVMNjkgODRMNjcgODRMNjcgODNMNjUgODNMNjUgODJMNjYgODJMNjYgODFMNjggODFMNjggODJMNjkgODJMNjkgODNMNzAgODNMNzAgODJMNzEgODJMNzEgODNMNzIgODNMNzIgODJMNzQgODJMNzQgODNMNzUgODNMNzUgODBMNzYgODBMNzYgNzlMNzUgNzlMNzUgNzdMNzMgNzdMNzMgNzhMNzEgNzhMNzEgNzdMNzIgNzdMNzIgNzZMNzAgNzZMNzAgNzhMNzEgNzhMNzEgNzlMNzIgNzlMNzIgODBMNjkgODBMNjkgNzdMNjggNzdMNjggNzZMNjkgNzZMNjkgNzVMNzAgNzVMNzAgNzRMNjkgNzRMNjkgNzVMNjggNzVMNjggNzNMNjkgNzNMNjkgNzJMNjcgNzJMNjcgNzFMNzAgNzFMNzAgNzBMNzEgNzBMNzEgNzFMNzMgNzFMNzMgNzJMNzQgNzJMNzQgNzNMNzMgNzNMNzMgNzRMNzEgNzRMNzEgNzVMNzMgNzVMNzMgNzZMNzYgNzZMNzYgNzVMNzUgNzVMNzUgNzRMNzQgNzRMNzQgNzNMNzUgNzNMNzUgNzJMNzYgNzJMNzYgNzFMNzMgNzFMNzMgNzBMNzUgNzBMNzUgNjdMNzMgNjdMNzMgNjZMNzQgNjZMNzQgNjVMNzMgNjVMNzMgNjRMNzYgNjRMNzYgNjNMNzQgNjNMNzQgNjJMNzUgNjJMNzUgNjBMNzYgNjBMNzYgNjFMNzcgNjFMNzcgNjJMODAgNjJMODAgNjNMODIgNjNMODIgNjJMODAgNjJMODAgNjBMODEgNjBMODEgNTlMODAgNTlMODAgNjBMNzkgNjBMNzkgNjFMNzggNjFMNzggNTlMNzUgNTlMNzUgNThMNzggNThMNzggNTdMNzcgNTdMNzcgNTZMNzYgNTZMNzYgNTVMNzcgNTVMNzcgNTRMNzggNTRMNzggNTVMODEgNTVMODEgNTdMODIgNTdMODIgNThMODMgNThMODMgNTdMODQgNTdMODQgNTNMODUgNTNMODUgNTVMODYgNTVMODYgNTZMODcgNTZMODcgNTVMODkgNTVMODkgNTZMOTAgNTZMOTAgNTNMODkgNTNMODkgNTJMODggNTJMODggNTFMODUgNTFMODUgNTBMODQgNTBMODQgNDlMODYgNDlMODYgNDhMODcgNDhMODcgNDdMODYgNDdMODYgNDZMODQgNDZMODQgNDNMODYgNDNMODYgNDRMODcgNDRMODcgNDNMODYgNDNMODYgNDJMODcgNDJMODcgNDFMODggNDFMODggNDNMODkgNDNMODkgNDJMOTAgNDJMOTAgNDFMODkgNDFMODkgMzlMOTAgMzlMOTAgMzhMODkgMzhMODkgMzdMOTEgMzdMOTEgMzZMOTAgMzZMOTAgMzRMODggMzRMODggMzNMODcgMzNMODcgMzRMODggMzRMODggMzhMODkgMzhMODkgMzlMODggMzlMODggNDBMODcgNDBMODcgMzlMODYgMzlMODYgMzZMODcgMzZMODcgMzVMODYgMzVMODYgMzZMODQgMzZMODQgMzVMODUgMzVMODUgMzRMODQgMzRMODQgMzVMODIgMzVMODIgMzRMODEgMzRMODEgMzNMODMgMzNMODMgMzJMODQgMzJMODQgMzBMODMgMzBMODMgMzFMODIgMzFMODIgMzBMODAgMzBMODAgMjhMNzkgMjhMNzkgMjdMODIgMjdMODIgMjlMODMgMjlMODMgMjhMODQgMjhMODQgMjdMODUgMjdMODUgMjhMODYgMjhMODYgMjdMODUgMjdMODUgMjZMODQgMjZMODQgMjVMODMgMjVMODMgMjRMODQgMjRMODQgMjNMODcgMjNMODcgMjJMODYgMjJMODYgMjFMODcgMjFMODcgMjBMODUgMjBMODUgMTlMODQgMTlMODQgMjFMODMgMjFMODMgMjBMODIgMjBMODIgMjFMODMgMjFMODMgMjRMODEgMjRMODEgMjVMODMgMjVMODMgMjZMNzkgMjZMNzkgMjVMODAgMjVMODAgMjRMNzkgMjRMNzkgMjVMNzcgMjVMNzcgMjZMNzYgMjZMNzYgMjVMNzUgMjVMNzUgMjRMNzggMjRMNzggMjNMNzkgMjNMNzkgMjJMODEgMjJMODEgMjNMODIgMjNMODIgMjJMODEgMjJMODEgMjBMNzkgMjBMNzkgMjFMNzggMjFMNzggMTlMNzcgMTlMNzcgMjFMNzUgMjFMNzUgMjBMNzQgMjBMNzQgMThMNzUgMThMNzUgMTZMNzYgMTZMNzYgMTdMNzcgMTdMNzcgMThMNzggMThMNzggMTdMNzcgMTdMNzcgMTVMNzggMTVMNzggMTZMNzkgMTZMNzkgMTlMODMgMTlMODMgMThMODQgMThMODQgMTdMODMgMTdMODMgMTZMODQgMTZMODQgMTVMODMgMTVMODMgMTRMODUgMTRMODUgMTVMODggMTVMODggMTZMODYgMTZMODYgMTlMODggMTlMODggMjJMODkgMjJMODkgMjBMOTAgMjBMOTAgMTdMOTEgMTdMOTEgMTZMODkgMTZMODkgMTVMODggMTVMODggMTRMODcgMTRMODcgMTJMODkgMTJMODkgMTFMOTEgMTFMOTEgMTBMOTIgMTBMOTIgOUw5MSA5TDkxIDEwTDg4IDEwTDg4IDlMODcgOUw4NyAxMEw4NiAxMEw4NiAxMUw4NSAxMUw4NSAxM0w4MyAxM0w4MyAxMkw4NCAxMkw4NCAxMUw4MiAxMUw4MiAxMEw4MSAxMEw4MSAxMUw4MiAxMUw4MiAxNEw4MCAxNEw4MCAxM0w4MSAxM0w4MSAxMkw3OSAxMkw3OSAxNEw3OCAxNEw3OCAxMUw3NyAxMUw3NyAxMEw3NiAxMEw3NiAxMUw3NSAxMUw3NSAxMkw3NiAxMkw3NiAxM0w3NyAxM0w3NyAxNUw3NSAxNUw3NSAxNkw3NCAxNkw3NCAxN0w3MyAxN0w3MyAxNUw3MiAxNUw3MiAxNkw3MSAxNkw3MSAxNUw2OSAxNUw2OSAxM0w2OCAxM0w2OCAxMkw2NyAxMkw2NyAxMUw2OCAxMUw2OCA4TDY5IDhMNjkgN0w2OCA3TDY4IDZMNjcgNkw2NyA3TDY2IDdMNjYgNkw2NSA2TDY1IDVMNjYgNUw2NiAyTDYzIDJMNjMgMUw2MiAxTDYyIDJMNjEgMkw2MSAzTDYyIDNMNjIgNEw2MSA0TDYxIDEwTDYyIDEwTDYyIDExTDYwIDExTDYwIDlMNTggOUw1OCAxMEw1NyAxMEw1NyAxMUw1OSAxMUw1OSAxMkw1NiAxMkw1NiAxMUw1NSAxMUw1NSAxMEw1NiAxMEw1NiA2TDU1IDZMNTUgNUw1NCA1TDU0IDFaTTc0IDFMNzQgMkw3NSAyTDc1IDNMNzYgM0w3NiAyTDc1IDJMNzUgMVpNNjIgMkw2MiAzTDYzIDNMNjMgNEw2NSA0TDY1IDNMNjMgM0w2MyAyWk0yNiAzTDI2IDRMMjcgNEwyNyA1TDI4IDVMMjggNEwyNyA0TDI3IDNaTTM1IDNMMzUgNEwzNiA0TDM2IDVMMzcgNUwzNyA2TDM2IDZMMzYgMTBMMzcgMTBMMzcgMTFMMzggMTFMMzggMTNMMzkgMTNMMzkgOUwzOCA5TDM4IDdMMzkgN0wzOSA0TDM4IDRMMzggNUwzNyA1TDM3IDNaTTQ2IDNMNDYgNEw0NyA0TDQ3IDNaTTU2IDNMNTYgNEw1NyA0TDU3IDNaTTc5IDNMNzkgNEw4MSA0TDgxIDNaTTUyIDRMNTIgNUw1MSA1TDUxIDZMNTAgNkw1MCA3TDUxIDdMNTEgOEw1MiA4TDUyIDlMNTQgOUw1NCAxMEw1NSAxMEw1NSA5TDU0IDlMNTQgOEw1MiA4TDUyIDdMNTMgN0w1MyA2TDU0IDZMNTQgN0w1NSA3TDU1IDZMNTQgNkw1NCA1TDUzIDVMNTMgNFpNOSA1TDkgN0wxMCA3TDEwIDVaTTI5IDVMMjkgOEwzMiA4TDMyIDVaTTQ0IDVMNDQgNkw0MyA2TDQzIDdMNDQgN0w0NCA4TDQ1IDhMNDUgN0w0NiA3TDQ2IDZMNDUgNkw0NSA1Wk01MiA1TDUyIDZMNTEgNkw1MSA3TDUyIDdMNTIgNkw1MyA2TDUzIDVaTTU3IDVMNTcgOEw2MCA4TDYwIDVaTTYzIDVMNjMgNkw2MiA2TDYyIDdMNjMgN0w2MyA2TDY0IDZMNjQgOEw2MiA4TDYyIDEwTDYzIDEwTDYzIDExTDYyIDExTDYyIDEyTDYxIDEyTDYxIDEzTDYwIDEzTDYwIDE0TDU5IDE0TDU5IDEzTDU4IDEzTDU4IDE0TDU2IDE0TDU2IDEyTDU1IDEyTDU1IDExTDUyIDExTDUyIDEyTDU1IDEyTDU1IDE0TDU0IDE0TDU0IDE1TDUzIDE1TDUzIDE2TDU0IDE2TDU0IDE4TDU1IDE4TDU1IDE5TDUzIDE5TDUzIDE3TDUyIDE3TDUyIDE4TDUxIDE4TDUxIDE5TDQ5IDE5TDQ5IDIwTDUwIDIwTDUwIDIxTDUxIDIxTDUxIDIyTDQ4IDIyTDQ4IDIxTDQ3IDIxTDQ3IDIyTDQ2IDIyTDQ2IDIzTDQ3IDIzTDQ3IDI1TDQ5IDI1TDQ5IDI3TDQ4IDI3TDQ4IDI2TDQ3IDI2TDQ3IDI3TDQ2IDI3TDQ2IDI2TDQ0IDI2TDQ0IDI3TDQzIDI3TDQzIDI2TDQxIDI2TDQxIDI1TDQzIDI1TDQzIDI0TDQyIDI0TDQyIDIzTDQxIDIzTDQxIDI0TDQwIDI0TDQwIDI2TDQxIDI2TDQxIDI3TDQzIDI3TDQzIDI5TDQyIDI5TDQyIDI4TDM5IDI4TDM5IDI5TDQwIDI5TDQwIDMwTDM4IDMwTDM4IDI2TDM5IDI2TDM5IDI1TDM3IDI1TDM3IDI0TDM4IDI0TDM4IDIzTDM3IDIzTDM3IDI0TDM2IDI0TDM2IDI2TDM1IDI2TDM1IDIzTDM0IDIzTDM0IDIyTDMzIDIyTDMzIDIzTDM0IDIzTDM0IDI2TDM1IDI2TDM1IDI3TDM0IDI3TDM0IDI4TDM2IDI4TDM2IDMwTDM3IDMwTDM3IDMxTDM1IDMxTDM1IDM0TDM2IDM0TDM2IDM1TDM4IDM1TDM4IDM2TDM1IDM2TDM1IDM1TDM0IDM1TDM0IDM3TDMzIDM3TDMzIDM4TDMyIDM4TDMyIDM3TDMxIDM3TDMxIDQwTDMyIDQwTDMyIDQxTDM0IDQxTDM0IDQyTDMzIDQyTDMzIDQzTDMyIDQzTDMyIDQyTDMxIDQyTDMxIDQxTDMwIDQxTDMwIDQwTDI4IDQwTDI4IDQxTDI3IDQxTDI3IDQwTDI1IDQwTDI1IDM5TDI3IDM5TDI3IDM4TDI4IDM4TDI4IDM3TDI1IDM3TDI1IDM2TDI0IDM2TDI0IDM3TDIzIDM3TDIzIDM2TDIyIDM2TDIyIDM1TDIxIDM1TDIxIDM0TDIwIDM0TDIwIDM1TDIxIDM1TDIxIDM2TDIyIDM2TDIyIDM3TDIxIDM3TDIxIDM5TDIwIDM5TDIwIDM2TDE5IDM2TDE5IDM4TDE4IDM4TDE4IDM5TDE5IDM5TDE5IDQyTDE4IDQyTDE4IDQzTDE5IDQzTDE5IDQyTDIwIDQyTDIwIDQwTDIxIDQwTDIxIDQxTDIyIDQxTDIyIDQwTDIxIDQwTDIxIDM5TDIyIDM5TDIyIDM3TDIzIDM3TDIzIDM4TDI0IDM4TDI0IDM3TDI1IDM3TDI1IDM5TDI0IDM5TDI0IDQwTDIzIDQwTDIzIDQ2TDI0IDQ2TDI0IDQ3TDI1IDQ3TDI1IDQ4TDI2IDQ4TDI2IDQ5TDI3IDQ5TDI3IDUwTDI1IDUwTDI1IDUxTDI0IDUxTDI0IDQ5TDIzIDQ5TDIzIDQ4TDIyIDQ4TDIyIDQ5TDIxIDQ5TDIxIDUwTDIyIDUwTDIyIDQ5TDIzIDQ5TDIzIDUxTDIyIDUxTDIyIDUyTDIxIDUyTDIxIDUzTDI1IDUzTDI1IDUxTDI2IDUxTDI2IDUyTDI4IDUyTDI4IDQ5TDI5IDQ5TDI5IDUzTDI4IDUzTDI4IDU0TDI3IDU0TDI3IDUzTDI2IDUzTDI2IDU0TDI3IDU0TDI3IDU1TDI1IDU1TDI1IDU2TDI0IDU2TDI0IDU0TDIyIDU0TDIyIDU1TDIzIDU1TDIzIDU2TDIxIDU2TDIxIDU1TDIwIDU1TDIwIDU2TDE5IDU2TDE5IDU3TDE4IDU3TDE4IDU2TDE1IDU2TDE1IDU3TDE4IDU3TDE4IDU4TDE0IDU4TDE0IDYxTDEzIDYxTDEzIDYyTDEyIDYyTDEyIDYwTDExIDYwTDExIDYyTDEwIDYyTDEwIDYxTDkgNjFMOSA2M0w4IDYzTDggNjRMMTAgNjRMMTAgNjZMOSA2Nkw5IDY3TDggNjdMOCA2OUw3IDY5TDcgNjhMNiA2OEw2IDY5TDUgNjlMNSA3MEw2IDcwTDYgNzFMNyA3MUw3IDcwTDEwIDcwTDEwIDcxTDExIDcxTDExIDY5TDEyIDY5TDEyIDcwTDEzIDcwTDEzIDcyTDE1IDcyTDE1IDcxTDE0IDcxTDE0IDY5TDE2IDY5TDE2IDcyTDE3IDcyTDE3IDczTDE1IDczTDE1IDc2TDE4IDc2TDE4IDc4TDE5IDc4TDE5IDc0TDIwIDc0TDIwIDczTDIxIDczTDIxIDc0TDIyIDc0TDIyIDc1TDIzIDc1TDIzIDczTDI0IDczTDI0IDcyTDIyIDcyTDIyIDczTDIxIDczTDIxIDY5TDIyIDY5TDIyIDcwTDIzIDcwTDIzIDcxTDI0IDcxTDI0IDY3TDI1IDY3TDI1IDY4TDI2IDY4TDI2IDY3TDI1IDY3TDI1IDY2TDI2IDY2TDI2IDY0TDI1IDY0TDI1IDY2TDI0IDY2TDI0IDYzTDI1IDYzTDI1IDYyTDI0IDYyTDI0IDYxTDI1IDYxTDI1IDYwTDI3IDYwTDI3IDYxTDI2IDYxTDI2IDYzTDI3IDYzTDI3IDYyTDI4IDYyTDI4IDY0TDI3IDY0TDI3IDY1TDI5IDY1TDI5IDY2TDMwIDY2TDMwIDY4TDI5IDY4TDI5IDY3TDI4IDY3TDI4IDY2TDI3IDY2TDI3IDY4TDI5IDY4TDI5IDY5TDI1IDY5TDI1IDc0TDI0IDc0TDI0IDc1TDI2IDc1TDI2IDc3TDI4IDc3TDI4IDc4TDI5IDc4TDI5IDc2TDI4IDc2TDI4IDc1TDI3IDc1TDI3IDc0TDI2IDc0TDI2IDcyTDI3IDcyTDI3IDczTDI4IDczTDI4IDc0TDI5IDc0TDI5IDczTDI4IDczTDI4IDcyTDMwIDcyTDMwIDczTDMxIDczTDMxIDcyTDMwIDcyTDMwIDcxTDMzIDcxTDMzIDcwTDMyIDcwTDMyIDY5TDM1IDY5TDM1IDY3TDM0IDY3TDM0IDY1TDM3IDY1TDM3IDY5TDM4IDY5TDM4IDcxTDM3IDcxTDM3IDcwTDM1IDcwTDM1IDcxTDM0IDcxTDM0IDczTDM1IDczTDM1IDc0TDM2IDc0TDM2IDc2TDM3IDc2TDM3IDc4TDM2IDc4TDM2IDc5TDM1IDc5TDM1IDgxTDM3IDgxTDM3IDgyTDQwIDgyTDQwIDgzTDQxIDgzTDQxIDg0TDQyIDg0TDQyIDg1TDQzIDg1TDQzIDg4TDQ1IDg4TDQ1IDg3TDQ0IDg3TDQ0IDg2TDQ1IDg2TDQ1IDg1TDQ2IDg1TDQ2IDg4TDQ3IDg4TDQ3IDg3TDQ4IDg3TDQ4IDg4TDQ5IDg4TDQ5IDg3TDQ4IDg3TDQ4IDg2TDQ3IDg2TDQ3IDg0TDQ4IDg0TDQ4IDgzTDQ3IDgzTDQ3IDg0TDQ1IDg0TDQ1IDgzTDQ2IDgzTDQ2IDgyTDQ5IDgyTDQ5IDgwTDQ4IDgwTDQ4IDc5TDQ3IDc5TDQ3IDc4TDQ5IDc4TDQ5IDc5TDUwIDc5TDUwIDc4TDQ5IDc4TDQ5IDc3TDUyIDc3TDUyIDc4TDUxIDc4TDUxIDgxTDUwIDgxTDUwIDgyTDUxIDgyTDUxIDgzTDUzIDgzTDUzIDgyTDU1IDgyTDU1IDgzTDU0IDgzTDU0IDg0TDU1IDg0TDU1IDgzTDU2IDgzTDU2IDgyTDU1IDgyTDU1IDgwTDU0IDgwTDU0IDc3TDUzIDc3TDUzIDc1TDU0IDc1TDU0IDc2TDU1IDc2TDU1IDc3TDU2IDc3TDU2IDc2TDU4IDc2TDU4IDc4TDU5IDc4TDU5IDc2TDYwIDc2TDYwIDc1TDU5IDc1TDU5IDc0TDU4IDc0TDU4IDc1TDU3IDc1TDU3IDczTDU1IDczTDU1IDcyTDU4IDcyTDU4IDczTDU5IDczTDU5IDcyTDYwIDcyTDYwIDc0TDYxIDc0TDYxIDczTDYyIDczTDYyIDc3TDYzIDc3TDYzIDc5TDY0IDc5TDY0IDc4TDY1IDc4TDY1IDc3TDY2IDc3TDY2IDc4TDY4IDc4TDY4IDc3TDY2IDc3TDY2IDc2TDY4IDc2TDY4IDc1TDY3IDc1TDY3IDcyTDY2IDcyTDY2IDc0TDY1IDc0TDY1IDczTDY0IDczTDY0IDcyTDYzIDcyTDYzIDczTDYyIDczTDYyIDcyTDYwIDcyTDYwIDcxTDYxIDcxTDYxIDcwTDY0IDcwTDY0IDcxTDY2IDcxTDY2IDcwTDY0IDcwTDY0IDY5TDY1IDY5TDY1IDY4TDY2IDY4TDY2IDY5TDY3IDY5TDY3IDcwTDY4IDcwTDY4IDY5TDY3IDY5TDY3IDY4TDY4IDY4TDY4IDY3TDY5IDY3TDY5IDY2TDcwIDY2TDcwIDY0TDY5IDY0TDY5IDYzTDY4IDYzTDY4IDYyTDcxIDYyTDcxIDYxTDY5IDYxTDY5IDYwTDY4IDYwTDY4IDU5TDY5IDU5TDY5IDU4TDcwIDU4TDcwIDU3TDY5IDU3TDY5IDU4TDY4IDU4TDY4IDU5TDY3IDU5TDY3IDU4TDY1IDU4TDY1IDU3TDY0IDU3TDY0IDU2TDY1IDU2TDY1IDU1TDY2IDU1TDY2IDU2TDY3IDU2TDY3IDU1TDY2IDU1TDY2IDU0TDY3IDU0TDY3IDUzTDY2IDUzTDY2IDUwTDY4IDUwTDY4IDUxTDY3IDUxTDY3IDUyTDY4IDUyTDY4IDUzTDY5IDUzTDY5IDU0TDcwIDU0TDcwIDU1TDY4IDU1TDY4IDU2TDcyIDU2TDcyIDU1TDc1IDU1TDc1IDU0TDc2IDU0TDc2IDUzTDc5IDUzTDc5IDUyTDgwIDUyTDgwIDUzTDgxIDUzTDgxIDU0TDgyIDU0TDgyIDU1TDgzIDU1TDgzIDU0TDgyIDU0TDgyIDUzTDgxIDUzTDgxIDUyTDgzIDUyTDgzIDUzTDg0IDUzTDg0IDUyTDg1IDUyTDg1IDUzTDg4IDUzTDg4IDUyTDg1IDUyTDg1IDUxTDgxIDUxTDgxIDUwTDgzIDUwTDgzIDQ5TDgxIDQ5TDgxIDUwTDgwIDUwTDgwIDQ5TDc4IDQ5TDc4IDUwTDc3IDUwTDc3IDUxTDc4IDUxTDc4IDUyTDc1IDUyTDc1IDUxTDc2IDUxTDc2IDQ4TDc3IDQ4TDc3IDQ3TDc5IDQ3TDc5IDQ2TDgwIDQ2TDgwIDQ4TDgyIDQ4TDgyIDQ3TDgxIDQ3TDgxIDQ2TDgzIDQ2TDgzIDQzTDg0IDQzTDg0IDQyTDg1IDQyTDg1IDQxTDg2IDQxTDg2IDM5TDgzIDM5TDgzIDQwTDgyIDQwTDgyIDM3TDgzIDM3TDgzIDM4TDg0IDM4TDg0IDM3TDgzIDM3TDgzIDM2TDgyIDM2TDgyIDM1TDgxIDM1TDgxIDM2TDgyIDM2TDgyIDM3TDc5IDM3TDc5IDM2TDgwIDM2TDgwIDM1TDc5IDM1TDc5IDMzTDc4IDMzTDc4IDM0TDc3IDM0TDc3IDMwTDc2IDMwTDc2IDI4TDc3IDI4TDc3IDI5TDc4IDI5TDc4IDMwTDc5IDMwTDc5IDMxTDc4IDMxTDc4IDMyTDgwIDMyTDgwIDMzTDgxIDMzTDgxIDMyTDgyIDMyTDgyIDMxTDgwIDMxTDgwIDMwTDc5IDMwTDc5IDI4TDc4IDI4TDc4IDI2TDc3IDI2TDc3IDI3TDc2IDI3TDc2IDI2TDc1IDI2TDc1IDI1TDc0IDI1TDc0IDI0TDc1IDI0TDc1IDIzTDc4IDIzTDc4IDIyTDc1IDIyTDc1IDIxTDc0IDIxTDc0IDIwTDczIDIwTDczIDIxTDc0IDIxTDc0IDIyTDczIDIyTDczIDIzTDc0IDIzTDc0IDI0TDczIDI0TDczIDI1TDc0IDI1TDc0IDI2TDcyIDI2TDcyIDI1TDcxIDI1TDcxIDIzTDcyIDIzTDcyIDIxTDcxIDIxTDcxIDIyTDcwIDIyTDcwIDIwTDcyIDIwTDcyIDE4TDczIDE4TDczIDE3TDcyIDE3TDcyIDE4TDcxIDE4TDcxIDE2TDY5IDE2TDY5IDE3TDY4IDE3TDY4IDE4TDcxIDE4TDcxIDE5TDcwIDE5TDcwIDIwTDY5IDIwTDY5IDIxTDY3IDIxTDY3IDIwTDY4IDIwTDY4IDE5TDY2IDE5TDY2IDE4TDY3IDE4TDY3IDE3TDY2IDE3TDY2IDE2TDY1IDE2TDY1IDE1TDY0IDE1TDY0IDE2TDYzIDE2TDYzIDE3TDYyIDE3TDYyIDE4TDYxIDE4TDYxIDIwTDYyIDIwTDYyIDIyTDYwIDIyTDYwIDI0TDYxIDI0TDYxIDI1TDYwIDI1TDYwIDI2TDU5IDI2TDU5IDI1TDU4IDI1TDU4IDI0TDU5IDI0TDU5IDIzTDU4IDIzTDU4IDIyTDU5IDIyTDU5IDIxTDYwIDIxTDYwIDE5TDU5IDE5TDU5IDE4TDYwIDE4TDYwIDE3TDYxIDE3TDYxIDE2TDU5IDE2TDU5IDE1TDYzIDE1TDYzIDE0TDY1IDE0TDY1IDEzTDY2IDEzTDY2IDE0TDY4IDE0TDY4IDEzTDY3IDEzTDY3IDEyTDY1IDEyTDY1IDEzTDY0IDEzTDY0IDEyTDYzIDEyTDYzIDExTDY3IDExTDY3IDEwTDY0IDEwTDY0IDlMNjUgOUw2NSA2TDY0IDZMNjQgNVpNODIgNUw4MiA2TDgxIDZMODEgN0w4MiA3TDgyIDZMODMgNkw4MyA1Wk0xNSA2TDE1IDdMMTQgN0wxNCA4TDE1IDhMMTUgN0wxNiA3TDE2IDZaTTE5IDZMMTkgN0wyMCA3TDIwIDZaTTIyIDZMMjIgN0wyMyA3TDIzIDZaTTI1IDZMMjUgN0wyNiA3TDI2IDEwTDI3IDEwTDI3IDExTDI2IDExTDI2IDEyTDI3IDEyTDI3IDExTDI4IDExTDI4IDEyTDI5IDEyTDI5IDlMMjggOUwyOCA2TDI3IDZMMjcgN0wyNiA3TDI2IDZaTTMwIDZMMzAgN0wzMSA3TDMxIDZaTTM3IDZMMzcgN0wzOCA3TDM4IDZaTTQ0IDZMNDQgN0w0NSA3TDQ1IDZaTTQ3IDZMNDcgOEw0NiA4TDQ2IDlMNDcgOUw0NyAxMEw0OCAxMEw0OCA5TDQ5IDlMNDkgOEw0OCA4TDQ4IDZaTTU4IDZMNTggN0w1OSA3TDU5IDZaTTc5IDZMNzkgN0w4MCA3TDgwIDZaTTY3IDdMNjcgOEw2NiA4TDY2IDlMNjcgOUw2NyA4TDY4IDhMNjggN1pNODQgOEw4NCA5TDgzIDlMODMgMTBMODUgMTBMODUgOFpNMiA5TDIgMTBMMyAxMEwzIDlaTTMxIDlMMzEgMTBMMzAgMTBMMzAgMTFMMzEgMTFMMzEgMTBMMzIgMTBMMzIgOVpNMzMgOUwzMyAxMEwzNCAxMEwzNCA5Wk0zNyA5TDM3IDEwTDM4IDEwTDM4IDlaTTE0IDEwTDE0IDEyTDE1IDEyTDE1IDEwWk0yMCAxMEwyMCAxMUwxOSAxMUwxOSAxMkwyMiAxMkwyMiAxMUwyMSAxMUwyMSAxMFpNODcgMTBMODcgMTFMODYgMTFMODYgMTJMODcgMTJMODcgMTFMODggMTFMODggMTBaTTE3IDExTDE3IDEyTDE4IDEyTDE4IDExWk03NiAxMUw3NiAxMkw3NyAxMkw3NyAxMVpNNzAgMTJMNzAgMTRMNzQgMTRMNzQgMTNMNzMgMTNMNzMgMTJaTTExIDEzTDExIDE0TDEwIDE0TDEwIDE1TDExIDE1TDExIDE2TDEwIDE2TDEwIDE3TDkgMTdMOSAxNUw4IDE1TDggMTdMNyAxN0w3IDE4TDYgMThMNiAxOUw3IDE5TDcgMThMOCAxOEw4IDE5TDkgMTlMOSAyMkw4IDIyTDggMjRMNiAyNEw2IDI1TDExIDI1TDExIDI2TDEyIDI2TDEyIDI3TDEzIDI3TDEzIDI1TDEyIDI1TDEyIDI0TDEzIDI0TDEzIDIyTDE0IDIyTDE0IDIzTDE1IDIzTDE1IDIyTDE0IDIyTDE0IDIxTDE2IDIxTDE2IDIwTDE0IDIwTDE0IDE5TDEzIDE5TDEzIDE4TDEyIDE4TDEyIDE3TDExIDE3TDExIDE2TDEyIDE2TDEyIDEzWk0yMSAxM0wyMSAxNEwxOSAxNEwxOSAxNUwyMCAxNUwyMCAxNkwyMSAxNkwyMSAxNEwyMiAxNEwyMiAxM1pNNjEgMTNMNjEgMTRMNjIgMTRMNjIgMTNaTTg1IDEzTDg1IDE0TDg2IDE0TDg2IDEzWk01OCAxNEw1OCAxNUw1OSAxNUw1OSAxNFpNNTQgMTVMNTQgMTZMNTUgMTZMNTUgMTdMNTYgMTdMNTYgMThMNTggMThMNTggMTdMNTkgMTdMNTkgMTZMNTYgMTZMNTYgMTVaTTY3IDE1TDY3IDE2TDY4IDE2TDY4IDE1Wk03OSAxNUw3OSAxNkw4MCAxNkw4MCAxOEw4MiAxOEw4MiAxNkw4MyAxNkw4MyAxNUw4MSAxNUw4MSAxNkw4MCAxNkw4MCAxNVpNMjQgMTZMMjQgMThMMjUgMThMMjUgMTZaTTM3IDE2TDM3IDE5TDM2IDE5TDM2IDE3TDM1IDE3TDM1IDE5TDM2IDE5TDM2IDIxTDM1IDIxTDM1IDIyTDM2IDIyTDM2IDIxTDM4IDIxTDM4IDIwTDM3IDIwTDM3IDE5TDM4IDE5TDM4IDE2Wk02NCAxNkw2NCAxN0w2NSAxN0w2NSAxOEw2NCAxOEw2NCAxOUw2MyAxOUw2MyAyMEw2NCAyMEw2NCAxOUw2NSAxOUw2NSAyMkw2NCAyMkw2NCAyMUw2MyAyMUw2MyAyMkw2MiAyMkw2MiAyM0w2MSAyM0w2MSAyNEw2MiAyNEw2MiAyNUw2MSAyNUw2MSAyNkw2MCAyNkw2MCAyN0w1OSAyN0w1OSAyOEw2MCAyOEw2MCAyN0w2MSAyN0w2MSAyOEw2MiAyOEw2MiAyOUw2MSAyOUw2MSAzMEw2MiAzMEw2MiAzMUw2MSAzMUw2MSAzM0w1OCAzM0w1OCAzNEw1OSAzNEw1OSAzN0w2MCAzN0w2MCAzOUw2MSAzOUw2MSA0MEw1OSA0MEw1OSAzOEw1OCAzOEw1OCA0MUw1OSA0MUw1OSA0M0w1OCA0M0w1OCA0Mkw1NyA0Mkw1NyA0MEw1NiA0MEw1NiA0Mkw1NSA0Mkw1NSA0MEw1NCA0MEw1NCA0Mkw1MyA0Mkw1MyA0M0w1MSA0M0w1MSA0Mkw1MiA0Mkw1MiA0MUw0NyA0MUw0NyA0MEw0NSA0MEw0NSA0MUw0NyA0MUw0NyA0Mkw0OCA0Mkw0OCA0M0w0OSA0M0w0OSA0NEw0NyA0NEw0NyA0M0w0NiA0M0w0NiA0Mkw0NSA0Mkw0NSA0NEw0MyA0NEw0MyA0M0w0NCA0M0w0NCA0Mkw0MyA0Mkw0MyA0MUw0MSA0MUw0MSAzOUw0MiAzOUw0MiA0MEw0NCA0MEw0NCAzOEw0NSAzOEw0NSAzOUw0NiAzOUw0NiAzOEw0NSAzOEw0NSAzN0w0NyAzN0w0NyAzNkw0NSAzNkw0NSAzN0w0NCAzN0w0NCAzNUw0NSAzNUw0NSAzNEw0NiAzNEw0NiAzNUw1MCAzNUw1MCAzNkw0OCAzNkw0OCAzN0w1MCAzN0w1MCAzOEw0OCAzOEw0OCAzOUw1MCAzOUw1MCAzOEw1MSAzOEw1MSAzN0w1MyAzN0w1MyAzOEw1MiAzOEw1MiAzOUw1MSAzOUw1MSA0MEw1MiA0MEw1MiAzOUw1MyAzOUw1MyAzOEw1NCAzOEw1NCAzOUw1NiAzOUw1NiAzOEw1NyAzOEw1NyAzNkw1NiAzNkw1NiAzNUw1NyAzNUw1NyAzM0w1NiAzM0w1NiAyOUw1NSAyOUw1NSAyOEw1NiAyOEw1NiAyN0w1NyAyN0w1NyAyNkw1OCAyNkw1OCAyNUw1NyAyNUw1NyAyNkw1NSAyNkw1NSAyNUw1NiAyNUw1NiAyNEw1NyAyNEw1NyAyMkw1NiAyMkw1NiAyMUw1NyAyMUw1NyAyMEw1OCAyMEw1OCAxOUw1NyAxOUw1NyAyMEw1NSAyMEw1NSAyMkw1NCAyMkw1NCAyMEw1MyAyMEw1MyAxOUw1MiAxOUw1MiAyMUw1MyAyMUw1MyAyMkw1NCAyMkw1NCAyM0w1MCAyM0w1MCAyNEw0OSAyNEw0OSAyM0w0OCAyM0w0OCAyNEw0OSAyNEw0OSAyNUw1MCAyNUw1MCAyN0w1MSAyN0w1MSAyOEw0NiAyOEw0NiAyN0w0NCAyN0w0NCAyOUw0MyAyOUw0MyAzMEw0MSAzMEw0MSAzMkw0MCAzMkw0MCAzMUwzNyAzMUwzNyAzM0wzOCAzM0wzOCAzNUwzOSAzNUwzOSAzN0w0MCAzN0w0MCAzNEwzOSAzNEwzOSAzM0w0MSAzM0w0MSAzNEw0NCAzNEw0NCAzNUw0MyAzNUw0MyAzN0w0MSAzN0w0MSAzOUwzOSAzOUwzOSAzOEwzOCAzOEwzOCAzN0wzNyAzN0wzNyAzOEwzOCAzOEwzOCAzOUwzOSAzOUwzOSA0MEwzOCA0MEwzOCA0MUw0MSA0MUw0MSA0NEwzOSA0NEwzOSA0MkwzOCA0MkwzOCA0NkwzOSA0NkwzOSA0N0wzOCA0N0wzOCA0OUw0MCA0OUw0MCA1MEw0MSA1MEw0MSA1MUwzOSA1MUwzOSA1MEwzNyA1MEwzNyA1MkwzOCA1MkwzOCA1M0wzNiA1M0wzNiA1NUwzNSA1NUwzNSA1NkwzNCA1NkwzNCA1NEwzNSA1NEwzNSA1M0wzNCA1M0wzNCA1MkwzNiA1MkwzNiA1MUwzNCA1MUwzNCA1MEwzNSA1MEwzNSA0OUwzNCA0OUwzNCA1MEwzMyA1MEwzMyA0N0wzMiA0N0wzMiA0NkwzMCA0NkwzMCA0MkwyOSA0MkwyOSA0MUwyOCA0MUwyOCA0MkwyNiA0MkwyNiA0M0wyNSA0M0wyNSA0MkwyNCA0MkwyNCA0M0wyNSA0M0wyNSA0NEwyNCA0NEwyNCA0NUwyNSA0NUwyNSA0NEwyNiA0NEwyNiA0NUwyNyA0NUwyNyA0NkwyNSA0NkwyNSA0N0wyNiA0N0wyNiA0OEwyNyA0OEwyNyA0OUwyOCA0OUwyOCA0OEwyOSA0OEwyOSA0NkwzMCA0NkwzMCA0OEwzMSA0OEwzMSA0N0wzMiA0N0wzMiA0OUwzMSA0OUwzMSA1MUwzMCA1MUwzMCA1MkwzMSA1MkwzMSA1MUwzMiA1MUwzMiA1MkwzMyA1MkwzMyA1M0wzNCA1M0wzNCA1NEwzMyA1NEwzMyA1NUwzMiA1NUwzMiA1NEwzMCA1NEwzMCA1M0wyOSA1M0wyOSA1NEwzMCA1NEwzMCA1NUwyOCA1NUwyOCA1NkwyNyA1NkwyNyA1N0wyNiA1N0wyNiA1NkwyNSA1NkwyNSA1N0wyMSA1N0wyMSA1NkwyMCA1NkwyMCA1OEwxOSA1OEwxOSA2MEwxOCA2MEwxOCA1OUwxNSA1OUwxNSA2MUwxNCA2MUwxNCA2MkwxMyA2MkwxMyA2NEwxMiA2NEwxMiA2NUwxMSA2NUwxMSA2NkwxMCA2NkwxMCA2N0w5IDY3TDkgNjlMMTAgNjlMMTAgNjhMMTEgNjhMMTEgNjZMMTMgNjZMMTMgNjdMMTUgNjdMMTUgNjZMMTcgNjZMMTcgNjdMMTggNjdMMTggNjZMMTcgNjZMMTcgNjRMMTUgNjRMMTUgNjNMMTQgNjNMMTQgNjJMMTUgNjJMMTUgNjFMMTYgNjFMMTYgNjNMMTggNjNMMTggNjRMMTkgNjRMMTkgNjZMMjAgNjZMMjAgNjdMMTkgNjdMMTkgNjhMMjIgNjhMMjIgNjZMMjMgNjZMMjMgNjNMMjQgNjNMMjQgNjJMMjEgNjJMMjEgNjFMMjQgNjFMMjQgNjBMMjUgNjBMMjUgNTlMMjQgNTlMMjQgNjBMMjIgNjBMMjIgNThMMjUgNThMMjUgNTdMMjYgNTdMMjYgNThMMjggNThMMjggNTZMMzAgNTZMMzAgNTVMMzIgNTVMMzIgNTZMMzMgNTZMMzMgNThMMzQgNThMMzQgNTlMMzUgNTlMMzUgNThMMzYgNThMMzYgNjFMMzcgNjFMMzcgNjBMMzggNjBMMzggNjJMMzkgNjJMMzkgNjNMMzcgNjNMMzcgNjJMMzYgNjJMMzYgNjNMMzcgNjNMMzcgNjRMMzggNjRMMzggNjVMMzkgNjVMMzkgNjZMMzggNjZMMzggNjdMMzkgNjdMMzkgNjhMMzggNjhMMzggNjlMMzkgNjlMMzkgNzBMNDAgNzBMNDAgNzFMNDEgNzFMNDEgNzJMMzkgNzJMMzkgNzFMMzggNzFMMzggNzJMMzcgNzJMMzcgNzNMMzggNzNMMzggNzJMMzkgNzJMMzkgNzVMMzggNzVMMzggNzRMMzcgNzRMMzcgNzVMMzggNzVMMzggNzhMMzcgNzhMMzcgNzlMMzYgNzlMMzYgODBMMzggODBMMzggODFMNDEgODFMNDEgODJMNDIgODJMNDIgODNMNDMgODNMNDMgODRMNDQgODRMNDQgODVMNDUgODVMNDUgODRMNDQgODRMNDQgODNMNDUgODNMNDUgODJMNDYgODJMNDYgNzdMNDQgNzdMNDQgNzZMNDYgNzZMNDYgNzVMNDQgNzVMNDQgNzZMNDMgNzZMNDMgNzVMNDEgNzVMNDEgNzRMNDcgNzRMNDcgNzFMNDYgNzFMNDYgNzNMNDQgNzNMNDQgNzJMNDIgNzJMNDIgNzFMNDEgNzFMNDEgNjlMNDAgNjlMNDAgNjdMMzkgNjdMMzkgNjZMNDIgNjZMNDIgNjdMNDMgNjdMNDMgNjlMNDIgNjlMNDIgNzBMNDQgNzBMNDQgNzFMNDUgNzFMNDUgNjlMNDYgNjlMNDYgNzBMNDggNzBMNDggNjlMNDkgNjlMNDkgNjhMNTAgNjhMNTAgNzFMNDggNzFMNDggNzJMNDkgNzJMNDkgNzNMNDggNzNMNDggNzRMNTAgNzRMNTAgNzNMNTEgNzNMNTEgNzJMNTUgNzJMNTUgNzFMNTQgNzFMNTQgNzBMNTUgNzBMNTUgNjdMNTcgNjdMNTcgNjhMNTYgNjhMNTYgNjlMNTcgNjlMNTcgNjhMNTggNjhMNTggNjlMNTkgNjlMNTkgNzBMNjAgNzBMNjAgNjlMNjEgNjlMNjEgNjhMNjIgNjhMNjIgNjlMNjMgNjlMNjMgNjhMNjQgNjhMNjQgNjdMNjMgNjdMNjMgNjhMNjIgNjhMNjIgNjdMNjEgNjdMNjEgNjhMNjAgNjhMNjAgNjlMNTkgNjlMNTkgNjhMNTggNjhMNTggNjdMNjAgNjdMNjAgNjZMNTggNjZMNTggNjVMNTkgNjVMNTkgNjRMNjAgNjRMNjAgNjVMNjEgNjVMNjEgNjNMNjIgNjNMNjIgNjRMNjQgNjRMNjQgNjVMNjMgNjVMNjMgNjZMNjUgNjZMNjUgNjdMNjggNjdMNjggNjZMNjkgNjZMNjkgNjRMNjcgNjRMNjcgNjZMNjYgNjZMNjYgNjFMNjcgNjFMNjcgNjJMNjggNjJMNjggNjBMNjYgNjBMNjYgNTlMNjMgNTlMNjMgNjBMNjIgNjBMNjIgNTlMNjEgNTlMNjEgNjFMNjAgNjFMNjAgNjJMNTkgNjJMNTkgNjFMNTYgNjFMNTYgNjNMNTUgNjNMNTUgNjRMNTYgNjRMNTYgNjVMNTcgNjVMNTcgNjZMNTUgNjZMNTUgNjVMNTQgNjVMNTQgNjZMNTUgNjZMNTUgNjdMNTQgNjdMNTQgNzBMNTIgNzBMNTIgNzFMNTEgNzFMNTEgNjlMNTMgNjlMNTMgNjdMNTEgNjdMNTEgNjZMNTIgNjZMNTIgNjVMNTEgNjVMNTEgNjZMNTAgNjZMNTAgNjRMNTIgNjRMNTIgNjJMNTMgNjJMNTMgNjRMNTQgNjRMNTQgNjJMNTUgNjJMNTUgNjBMNTYgNjBMNTYgNThMNTQgNThMNTQgNTdMNTMgNTdMNTMgNTNMNTQgNTNMNTQgNTRMNTUgNTRMNTUgNTVMNTQgNTVMNTQgNTZMNTUgNTZMNTUgNTdMNTYgNTdMNTYgNTZMNTkgNTZMNTkgNTVMNjAgNTVMNjAgNTZMNjEgNTZMNjEgNThMNjMgNThMNjMgNTdMNjIgNTdMNjIgNTZMNjEgNTZMNjEgNTVMNjAgNTVMNjAgNTJMNTcgNTJMNTcgNTFMNTkgNTFMNTkgNTBMNjAgNTBMNjAgNTFMNjEgNTFMNjEgNTRMNjIgNTRMNjIgNTVMNjMgNTVMNjMgNTZMNjQgNTZMNjQgNTVMNjUgNTVMNjUgNTRMNjYgNTRMNjYgNTNMNjUgNTNMNjUgNTJMNjQgNTJMNjQgNTNMNjMgNTNMNjMgNTFMNjEgNTFMNjEgNTBMNjIgNTBMNjIgNDlMNjMgNDlMNjMgNTBMNjYgNTBMNjYgNDlMNjggNDlMNjggNDhMNjYgNDhMNjYgNDdMNjcgNDdMNjcgNDZMNjggNDZMNjggNDdMNzAgNDdMNzAgNDlMNzEgNDlMNzEgNTFMNzAgNTFMNzAgNTBMNjkgNTBMNjkgNTJMNzAgNTJMNzAgNTNMNzEgNTNMNzEgNTVMNzIgNTVMNzIgNTRMNzQgNTRMNzQgNTJMNzMgNTJMNzMgNTFMNzIgNTFMNzIgNTBMNzQgNTBMNzQgNTFMNzUgNTFMNzUgNDlMNzQgNDlMNzQgNDhMNzYgNDhMNzYgNDdMNzcgNDdMNzcgNDZMNzkgNDZMNzkgNDVMODAgNDVMODAgNDZMODEgNDZMODEgNDNMODIgNDNMODIgNDJMODEgNDJMODEgNDNMODAgNDNMODAgNDRMNzkgNDRMNzkgNDNMNzYgNDNMNzYgNDJMNzggNDJMNzggNDBMNzkgNDBMNzkgNDJMODAgNDJMODAgNDBMODEgNDBMODEgMzlMODAgMzlMODAgMzhMNzkgMzhMNzkgMzdMNzggMzdMNzggMzZMNzkgMzZMNzkgMzVMNzggMzVMNzggMzZMNzcgMzZMNzcgMzhMNzYgMzhMNzYgMzlMNzUgMzlMNzUgNDBMNzQgNDBMNzQgNDFMNzMgNDFMNzMgMzlMNzIgMzlMNzIgMzhMNzQgMzhMNzQgMzdMNzUgMzdMNzUgMzZMNzYgMzZMNzYgMzVMNzcgMzVMNzcgMzRMNzYgMzRMNzYgMzVMNzMgMzVMNzMgMzRMNzUgMzRMNzUgMzJMNzYgMzJMNzYgMzFMNzQgMzFMNzQgMzJMNzMgMzJMNzMgMzFMNzIgMzFMNzIgMzJMNzEgMzJMNzEgMjlMNzIgMjlMNzIgMjhMNzMgMjhMNzMgMzBMNzQgMzBMNzQgMjhMNzUgMjhMNzUgMjdMNzIgMjdMNzIgMjZMNzEgMjZMNzEgMjVMNzAgMjVMNzAgMjRMNjggMjRMNjggMjJMNjcgMjJMNjcgMjNMNjUgMjNMNjUgMjJMNjYgMjJMNjYgMTlMNjUgMTlMNjUgMThMNjYgMThMNjYgMTdMNjUgMTdMNjUgMTZaTTg4IDE2TDg4IDE3TDg5IDE3TDg5IDE2Wk04IDE3TDggMThMOSAxOEw5IDE5TDEwIDE5TDEwIDE4TDkgMThMOSAxN1pNODggMThMODggMTlMODkgMTlMODkgMThaTTEyIDE5TDEyIDIwTDEzIDIwTDEzIDIxTDE0IDIxTDE0IDIwTDEzIDIwTDEzIDE5Wk0xMCAyMEwxMCAyMUwxMSAyMUwxMSAyMFpNOTIgMjFMOTIgMjJMOTMgMjJMOTMgMjFaTTYgMjJMNiAyM0w3IDIzTDcgMjJaTTExIDIyTDExIDI0TDEyIDI0TDEyIDIyWk02OSAyMkw2OSAyM0w3MCAyM0w3MCAyMlpNOSAyM0w5IDI0TDEwIDI0TDEwIDIzWk0yMSAyM0wyMSAyNEwyMiAyNEwyMiAyM1pNMjcgMjNMMjcgMjRMMjggMjRMMjggMjNaTTU1IDIzTDU1IDI0TDU0IDI0TDU0IDI1TDU1IDI1TDU1IDI0TDU2IDI0TDU2IDIzWk02MiAyM0w2MiAyNEw2MyAyNEw2MyAyNUw2MiAyNUw2MiAyNkw2MSAyNkw2MSAyN0w2MiAyN0w2MiAyOEw2MyAyOEw2MyAyOUw2MiAyOUw2MiAzMEw2MyAzMEw2MyAzMUw2MiAzMUw2MiAzM0w2MyAzM0w2MyAzNUw2NCAzNUw2NCAzNkw2MyAzNkw2MyAzN0w2MiAzN0w2MiAzOEw2MSAzOEw2MSAzOUw2NCAzOUw2NCA0MEw2MyA0MEw2MyA0Mkw2MCA0Mkw2MCA0M0w1OSA0M0w1OSA0NEw2MCA0NEw2MCA0NUw2NCA0NUw2NCA0Nkw2MCA0Nkw2MCA0N0w1OSA0N0w1OSA0NUw1OCA0NUw1OCA0NEw1NyA0NEw1NyA0Nkw1NiA0Nkw1NiA0M0w1NSA0M0w1NSA0NUw1MSA0NUw1MSA0M0w1MCA0M0w1MCA0NEw0OSA0NEw0OSA0NUw0NyA0NUw0NyA0Nkw0OCA0Nkw0OCA0N0w0NyA0N0w0NyA0OUw1MCA0OUw1MCA1MEw0OSA1MEw0OSA1MUw0OCA1MUw0OCA1MEw0NiA1MEw0NiA0OUw0MyA0OUw0MyA0OEw0NCA0OEw0NCA0N0w0NiA0N0w0NiA0Nkw0MCA0Nkw0MCA0N0wzOSA0N0wzOSA0OEw0MCA0OEw0MCA0OUw0MiA0OUw0MiA1MEw0NCA1MEw0NCA1MUw0MSA1MUw0MSA1Mkw0MiA1Mkw0MiA1M0w0MSA1M0w0MSA1NEwzOSA1NEwzOSA1M0w0MCA1M0w0MCA1MkwzOSA1MkwzOSA1MUwzOCA1MUwzOCA1MkwzOSA1MkwzOSA1M0wzOCA1M0wzOCA1NUwzOSA1NUwzOSA1Nkw0MCA1Nkw0MCA1NUw0MSA1NUw0MSA1Nkw0MiA1Nkw0MiA1N0w0MyA1N0w0MyA1OEw0MiA1OEw0MiA2MEw0MyA2MEw0MyA2NEw0MiA2NEw0MiA2Mkw0MSA2Mkw0MSA2NEw0MiA2NEw0MiA2NUw0MyA2NUw0MyA2N0w0NCA2N0w0NCA2OEw0NiA2OEw0NiA2OUw0OCA2OUw0OCA2OEw0OSA2OEw0OSA2N0w0OCA2N0w0OCA2Mkw1MiA2Mkw1MiA2MUw1MyA2MUw1MyA2MEw1MCA2MEw1MCA1OEw1MSA1OEw1MSA1OUw1NCA1OUw1NCA1OEw1MSA1OEw1MSA1N0w1MiA1N0w1MiA1Nkw1MSA1Nkw1MSA1N0w0OSA1N0w0OSA1NUw1MSA1NUw1MSA1NEw1MCA1NEw1MCA1MEw1MSA1MEw1MSA0OUw1MiA0OUw1MiA0OEw1MSA0OEw1MSA0OUw1MCA0OUw1MCA0OEw0OCA0OEw0OCA0N0w1MSA0N0w1MSA0Nkw1MyA0Nkw1MyA0OUw1NCA0OUw1NCA0N0w1NSA0N0w1NSA0Nkw1NiA0Nkw1NiA0N0w1NyA0N0w1NyA0OEw1NSA0OEw1NSA0OUw1NiA0OUw1NiA1MEw1OCA1MEw1OCA0OUw1NyA0OUw1NyA0OEw1OSA0OEw1OSA0OUw2MCA0OUw2MCA1MEw2MSA1MEw2MSA0OEw2MiA0OEw2MiA0N0w2NCA0N0w2NCA0OEw2MyA0OEw2MyA0OUw2NCA0OUw2NCA0OEw2NSA0OEw2NSA0N0w2NiA0N0w2NiA0Nkw2NSA0Nkw2NSA0NEw2NiA0NEw2NiA0M0w2NyA0M0w2NyA0NEw2OCA0NEw2OCA0NUw2OSA0NUw2OSA0Nkw3MCA0Nkw3MCA0N0w3MSA0N0w3MSA0OEw3MiA0OEw3MiA0N0w3MyA0N0w3MyA0OEw3NCA0OEw3NCA0N0w3NiA0N0w3NiA0NEw3NCA0NEw3NCA0Mkw3MyA0Mkw3MyA0M0w3MiA0M0w3MiA0MUw3MSA0MUw3MSA0Mkw3MCA0Mkw3MCA0MUw2OSA0MUw2OSA0MEw3MCA0MEw3MCAzOUw3MSAzOUw3MSA0MEw3MiA0MEw3MiAzOUw3MSAzOUw3MSAzN0w3MCAzN0w3MCAzNkw2OSAzNkw2OSAzN0w2OCAzN0w2OCAzOUw2NyAzOUw2NyA0MEw2NiA0MEw2NiA0Mkw2NSA0Mkw2NSA0NEw2MyA0NEw2MyA0M0w2NCA0M0w2NCA0MUw2NSA0MUw2NSAzOUw2NiAzOUw2NiAzOEw2NSAzOEw2NSAzNkw2NiAzNkw2NiAzN0w2NyAzN0w2NyAzNkw2OCAzNkw2OCAzNUw2NyAzNUw2NyAzNEw2OCAzNEw2OCAzM0w2OSAzM0w2OSAzNEw3MCAzNEw3MCAzNUw3MSAzNUw3MSAzNkw3MiAzNkw3MiAzN0w3MyAzN0w3MyAzNUw3MSAzNUw3MSAzNEw3MCAzNEw3MCAzM0w3MSAzM0w3MSAzMkw3MCAzMkw3MCAzMUw2NyAzMUw2NyAzMkw2NSAzMkw2NSAzMUw2NiAzMUw2NiAzMEw2NSAzMEw2NSAzMUw2NCAzMUw2NCAyOEw2NSAyOEw2NSAyN0w2NyAyN0w2NyAyOEw2NiAyOEw2NiAyOUw2NyAyOUw2NyAyOEw2OCAyOEw2OCAzMEw3MCAzMEw3MCAyOUw2OSAyOUw2OSAyOEw2OCAyOEw2OCAyN0w2OSAyN0w2OSAyNkw3MCAyNkw3MCAyNUw2OSAyNUw2OSAyNkw2OCAyNkw2OCAyN0w2NyAyN0w2NyAyNEw2NSAyNEw2NSAyM1pNMzIgMjRMMzIgMjVMMzMgMjVMMzMgMjRaTTUxIDI0TDUxIDI1TDUyIDI1TDUyIDI0Wk02NCAyNEw2NCAyNUw2MyAyNUw2MyAyN0w2NSAyN0w2NSAyNkw2NiAyNkw2NiAyNUw2NSAyNUw2NSAyNFpNMTcgMjVMMTcgMjZMMTggMjZMMTggMjVaTTI0IDI2TDI0IDI3TDIzIDI3TDIzIDI4TDI0IDI4TDI0IDI3TDI1IDI3TDI1IDI2Wk0zNiAyNkwzNiAyOEwzNyAyOEwzNyAyNlpNNTIgMjZMNTIgMjdMNTMgMjdMNTMgMjlMNTQgMjlMNTQgMzBMNTMgMzBMNTMgMzJMNTUgMzJMNTUgMzFMNTQgMzFMNTQgMzBMNTUgMzBMNTUgMjlMNTQgMjlMNTQgMjhMNTUgMjhMNTUgMjZaTTEgMjdMMSAyOEwwIDI4TDAgMjlMMSAyOUwxIDI4TDIgMjhMMiAzMEwxIDMwTDEgMzFMMyAzMUwzIDI3Wk01IDI5TDUgMzJMOCAzMkw4IDI5Wk05IDI5TDkgMzBMMTAgMzBMMTAgMjlaTTEyIDI5TDEyIDMwTDEzIDMwTDEzIDI5Wk0yOSAyOUwyOSAzMkwzMiAzMkwzMiAyOVpNNDQgMjlMNDQgMzBMNDMgMzBMNDMgMzFMNDIgMzFMNDIgMzJMNDEgMzJMNDEgMzNMNDQgMzNMNDQgMzRMNDUgMzRMNDUgMzNMNDQgMzNMNDQgMzJMNDMgMzJMNDMgMzFMNDUgMzFMNDUgMzJMNDYgMzJMNDYgMzRMNDggMzRMNDggMzNMNTAgMzNMNTAgMzJMNDggMzJMNDggMzFMNDkgMzFMNDkgMzBMNTEgMzBMNTEgMjlMNDcgMjlMNDcgMzBMNDggMzBMNDggMzFMNDYgMzFMNDYgMjlaTTU3IDI5TDU3IDMyTDYwIDMyTDYwIDI5Wk04NSAyOUw4NSAzMkw4OCAzMkw4OCAyOVpNNiAzMEw2IDMxTDcgMzFMNyAzMFpNMzAgMzBMMzAgMzFMMzEgMzFMMzEgMzBaTTU4IDMwTDU4IDMxTDU5IDMxTDU5IDMwWk04NiAzMEw4NiAzMUw4NyAzMUw4NyAzMFpNODkgMzBMODkgMzJMOTAgMzJMOTAgMzBaTTEwIDMxTDEwIDMyTDkgMzJMOSAzNEw4IDM0TDggMzNMNCAzM0w0IDM1TDIgMzVMMiAzNkw0IDM2TDQgMzdMMyAzN0wzIDM5TDIgMzlMMiA0MUwzIDQxTDMgNDNMMiA0M0wyIDQ0TDMgNDRMMyA0M0w0IDQzTDQgMzlMNSAzOUw1IDQxTDYgNDFMNiA0Mkw1IDQyTDUgNDRMNyA0NEw3IDQ1TDYgNDVMNiA0Nkw3IDQ2TDcgNDVMOSA0NUw5IDQ0TDEwIDQ0TDEwIDQzTDkgNDNMOSA0Mkw3IDQyTDcgNDFMNiA0MUw2IDQwTDcgNDBMNyAzOUw1IDM5TDUgMzhMNCAzOEw0IDM3TDYgMzdMNiAzOEw3IDM4TDcgMzdMNiAzN0w2IDM2TDEwIDM2TDEwIDM1TDExIDM1TDExIDMzTDEwIDMzTDEwIDMyTDExIDMyTDExIDMxWk0yMCAzMUwyMCAzMkwyMSAzMkwyMSAzM0wyMiAzM0wyMiAzNEwyMyAzNEwyMyAzNUwyNSAzNUwyNSAzNEwyMyAzNEwyMyAzM0wyMiAzM0wyMiAzMkwyMyAzMkwyMyAzMVpNMjUgMzFMMjUgMzJMMjQgMzJMMjQgMzNMMjYgMzNMMjYgMzJMMjcgMzJMMjcgMzFaTTYzIDMxTDYzIDMyTDY0IDMyTDY0IDMxWk0xMiAzMkwxMiAzM0wxMyAzM0wxMyAzMlpNNjcgMzJMNjcgMzNMNjUgMzNMNjUgMzVMNjYgMzVMNjYgMzRMNjcgMzRMNjcgMzNMNjggMzNMNjggMzJaTTEgMzNMMSAzNEwzIDM0TDMgMzNaTTUxIDMzTDUxIDM0TDUwIDM0TDUwIDM1TDUxIDM1TDUxIDM2TDU1IDM2TDU1IDM4TDU2IDM4TDU2IDM2TDU1IDM2TDU1IDM1TDU2IDM1TDU2IDMzTDU0IDMzTDU0IDM1TDUzIDM1TDUzIDM0TDUyIDM0TDUyIDMzWk01IDM0TDUgMzVMNCAzNUw0IDM2TDYgMzZMNiAzNUw3IDM1TDcgMzRaTTkgMzRMOSAzNUwxMCAzNUwxMCAzNFpNNTEgMzRMNTEgMzVMNTIgMzVMNTIgMzRaTTYwIDM0TDYwIDM3TDYxIDM3TDYxIDM2TDYyIDM2TDYyIDM0Wk0xMiAzNUwxMiAzNkwxMyAzNkwxMyAzNVpNNDMgMzdMNDMgMzhMNDQgMzhMNDQgMzdaTTMzIDM4TDMzIDM5TDMyIDM5TDMyIDQwTDM0IDQwTDM0IDM4Wk02OSAzOEw2OSAzOUw3MCAzOUw3MCAzOFpNNzcgMzhMNzcgMzlMNzggMzlMNzggMzhaTTEwIDM5TDEwIDQxTDExIDQxTDExIDM5Wk0zNSAzOUwzNSA0MEwzNiA0MEwzNiAzOVpNNzkgMzlMNzkgNDBMODAgNDBMODAgMzlaTTE2IDQwTDE2IDQxTDE1IDQxTDE1IDQyTDE2IDQyTDE2IDQxTDE4IDQxTDE4IDQwWk0yNCA0MEwyNCA0MUwyNSA0MUwyNSA0MFpNNjEgNDBMNjEgNDFMNjIgNDFMNjIgNDBaTTY3IDQwTDY3IDQzTDcwIDQzTDcwIDQ0TDcxIDQ0TDcxIDQ1TDcwIDQ1TDcwIDQ2TDcxIDQ2TDcxIDQ3TDcyIDQ3TDcyIDQ0TDcxIDQ0TDcxIDQzTDcwIDQzTDcwIDQyTDY4IDQyTDY4IDQwWk03NSA0MEw3NSA0MUw3NiA0MUw3NiA0MFpNMzYgNDFMMzYgNDJMMzUgNDJMMzUgNDNMMzYgNDNMMzYgNDRMMzUgNDRMMzUgNDVMMzcgNDVMMzcgNDNMMzYgNDNMMzYgNDJMMzcgNDJMMzcgNDFaTTgzIDQxTDgzIDQyTDg0IDQyTDg0IDQxWk05MiA0MUw5MiA0Mkw5MyA0Mkw5MyA0MVpNNiA0Mkw2IDQzTDcgNDNMNyA0NEw5IDQ0TDkgNDNMNyA0M0w3IDQyWk0yMSA0MkwyMSA0M0wyMCA0M0wyMCA0NEwyMSA0NEwyMSA0M0wyMiA0M0wyMiA0MlpNMjggNDJMMjggNDNMMjcgNDNMMjcgNDRMMjkgNDRMMjkgNDJaTTQyIDQyTDQyIDQzTDQzIDQzTDQzIDQyWk0xMiA0M0wxMiA0NEwxMyA0NEwxMyA0NUwxNiA0NUwxNiA0NEwxMyA0NEwxMyA0M1pNMzEgNDNMMzEgNDVMMzIgNDVMMzIgNDNaTTMzIDQzTDMzIDQ0TDM0IDQ0TDM0IDQzWk02MSA0M0w2MSA0NEw2MiA0NEw2MiA0M1pNNDEgNDRMNDEgNDVMNDMgNDVMNDMgNDRaTTQ1IDQ0TDQ1IDQ1TDQ2IDQ1TDQ2IDQ0Wk04OCA0NEw4OCA0NUw5MCA0NUw5MCA0NFpNMzMgNDVMMzMgNDZMMzQgNDZMMzQgNDdMMzUgNDdMMzUgNDhMMzYgNDhMMzYgNDlMMzcgNDlMMzcgNDhMMzYgNDhMMzYgNDdMMzUgNDdMMzUgNDZMMzQgNDZMMzQgNDVaTTUwIDQ1TDUwIDQ2TDUxIDQ2TDUxIDQ1Wk03MyA0NUw3MyA0Nkw3NCA0Nkw3NCA0NVpNNjQgNDZMNjQgNDdMNjUgNDdMNjUgNDZaTTE0IDQ3TDE0IDUwTDEzIDUwTDEzIDUxTDE0IDUxTDE0IDUwTDE1IDUwTDE1IDQ3Wk0xNiA0N0wxNiA0OEwxNyA0OEwxNyA0N1pNNDAgNDdMNDAgNDhMNDMgNDhMNDMgNDdaTTgzIDQ3TDgzIDQ4TDg2IDQ4TDg2IDQ3Wk02IDQ5TDYgNTBMNyA1MEw3IDQ5Wk0xIDUwTDEgNTFMMiA1MUwyIDUyTDMgNTJMMyA1M0wyIDUzTDIgNTRMMyA1NEwzIDUzTDQgNTNMNCA1MkwzIDUyTDMgNTFMMiA1MUwyIDUwWk0xNiA1MEwxNiA1MUwxNSA1MUwxNSA1MkwxMyA1MkwxMyA1M0wxNSA1M0wxNSA1MkwxNiA1MkwxNiA1MUwxNyA1MUwxNyA1MFpNNDUgNTBMNDUgNTFMNDQgNTFMNDQgNTJMNDMgNTJMNDMgNTNMNDUgNTNMNDUgNTRMNDQgNTRMNDQgNTVMNDIgNTVMNDIgNTZMNDMgNTZMNDMgNTdMNDQgNTdMNDQgNTZMNDUgNTZMNDUgNTdMNDcgNTdMNDcgNThMNDYgNThMNDYgNTlMNDUgNTlMNDUgNjFMNDQgNjFMNDQgNjJMNDUgNjJMNDUgNjNMNDQgNjNMNDQgNjRMNDMgNjRMNDMgNjVMNDQgNjVMNDQgNjZMNDUgNjZMNDUgNjdMNDYgNjdMNDYgNjZMNDUgNjZMNDUgNjVMNDYgNjVMNDYgNjRMNDcgNjRMNDcgNjNMNDYgNjNMNDYgNjJMNDcgNjJMNDcgNThMNDggNThMNDggNTlMNDkgNTlMNDkgNTdMNDcgNTdMNDcgNTRMNDYgNTRMNDYgNTNMNDcgNTNMNDcgNTJMNDggNTJMNDggNTNMNDkgNTNMNDkgNTJMNDggNTJMNDggNTFMNDYgNTFMNDYgNTBaTTUzIDUwTDUzIDUxTDU1IDUxTDU1IDUyTDU2IDUyTDU2IDUxTDU1IDUxTDU1IDUwWk03OCA1MEw3OCA1MUw3OSA1MUw3OSA1MFpNMzMgNTFMMzMgNTJMMzQgNTJMMzQgNTFaTTcxIDUxTDcxIDUyTDcyIDUyTDcyIDUxWk00NSA1Mkw0NSA1M0w0NiA1M0w0NiA1MlpNNTIgNTJMNTIgNTNMNTMgNTNMNTMgNTJaTTU1IDUzTDU1IDU0TDU2IDU0TDU2IDUzWk0xNiA1NEwxNiA1NUwxOCA1NUwxOCA1NFpNNDUgNTRMNDUgNTZMNDYgNTZMNDYgNTRaTTQ4IDU0TDQ4IDU1TDQ5IDU1TDQ5IDU0Wk0xMCA1NUwxMCA1Nkw5IDU2TDkgNThMMTAgNThMMTAgNTZMMTEgNTZMMTEgNTVaTTM2IDU1TDM2IDU2TDM1IDU2TDM1IDU3TDM0IDU3TDM0IDU4TDM1IDU4TDM1IDU3TDM2IDU3TDM2IDU4TDM3IDU4TDM3IDU5TDM4IDU5TDM4IDYwTDM5IDYwTDM5IDYxTDQwIDYxTDQwIDYwTDQxIDYwTDQxIDU5TDQwIDU5TDQwIDU4TDQxIDU4TDQxIDU3TDQwIDU3TDQwIDU4TDM5IDU4TDM5IDU5TDM4IDU5TDM4IDU2TDM3IDU2TDM3IDU1Wk01NSA1NUw1NSA1Nkw1NiA1Nkw1NiA1NVpNNzUgNTZMNzUgNTdMNzQgNTdMNzQgNThMNzUgNThMNzUgNTdMNzYgNTdMNzYgNTZaTTc5IDU2TDc5IDU4TDgwIDU4TDgwIDU2Wk01IDU3TDUgNjBMOCA2MEw4IDU3Wk0yOSA1N0wyOSA2MEwzMiA2MEwzMiA1N1pNNTcgNTdMNTcgNjBMNjAgNjBMNjAgNTdaTTcyIDU3TDcyIDU4TDcxIDU4TDcxIDU5TDcwIDU5TDcwIDYwTDcyIDYwTDcyIDU4TDczIDU4TDczIDU3Wk04NSA1N0w4NSA2MEw4OCA2MEw4OCA1N1pNODkgNTdMODkgNThMOTAgNThMOTAgNTdaTTMgNThMMyA1OUw0IDU5TDQgNThaTTYgNThMNiA1OUw3IDU5TDcgNThaTTMwIDU4TDMwIDU5TDMxIDU5TDMxIDU4Wk00MyA1OEw0MyA1OUw0NCA1OUw0NCA1OFpNNTggNThMNTggNTlMNTkgNTlMNTkgNThaTTg2IDU4TDg2IDU5TDg3IDU5TDg3IDU4Wk0yMCA1OUwyMCA2MEwyMSA2MEwyMSA1OVpNMzkgNTlMMzkgNjBMNDAgNjBMNDAgNTlaTTgyIDU5TDgyIDYwTDgzIDYwTDgzIDU5Wk04OSA1OUw4OSA2MUw4OCA2MUw4OCA2NEw4OSA2NEw4OSA2Mkw5MSA2Mkw5MSA2MUw5MCA2MUw5MCA1OVpNMiA2MEwyIDYxTDMgNjFMMyA2MFpNMTcgNjBMMTcgNjFMMTggNjFMMTggNjNMMTkgNjNMMTkgNjFMMTggNjFMMTggNjBaTTMzIDYwTDMzIDYxTDM1IDYxTDM1IDYwWk00OCA2MEw0OCA2MUw1MCA2MUw1MCA2MFpNNjMgNjBMNjMgNjFMNjUgNjFMNjUgNjBaTTQgNjFMNCA2MkwzIDYyTDMgNjNMNCA2M0w0IDYyTDUgNjJMNSA2MVpNMzAgNjFMMzAgNjJMMzIgNjJMMzIgNjNMMjkgNjNMMjkgNjVMMzIgNjVMMzIgNjZMMzEgNjZMMzEgNjhMMzMgNjhMMzMgNjVMMzQgNjVMMzQgNjRMMzMgNjRMMzMgNjJMMzIgNjJMMzIgNjFaTTg0IDYxTDg0IDYyTDgzIDYyTDgzIDYzTDg0IDYzTDg0IDYyTDg3IDYyTDg3IDYxWk0xMSA2MkwxMSA2M0wxMiA2M0wxMiA2MlpNMjAgNjJMMjAgNjRMMjEgNjRMMjEgNjJaTTM0IDYyTDM0IDYzTDM1IDYzTDM1IDYyWk01NyA2Mkw1NyA2M0w1OCA2M0w1OCA2NEw1OSA2NEw1OSA2MlpNNjMgNjJMNjMgNjNMNjUgNjNMNjUgNjJaTTcyIDYyTDcyIDYzTDcxIDYzTDcxIDY0TDcyIDY0TDcyIDYzTDczIDYzTDczIDYyWk0zOSA2M0wzOSA2NEw0MCA2NEw0MCA2M1pNNDUgNjNMNDUgNjRMNDQgNjRMNDQgNjVMNDUgNjVMNDUgNjRMNDYgNjRMNDYgNjNaTTQ5IDYzTDQ5IDY0TDUwIDY0TDUwIDYzWk0xMyA2NEwxMyA2NkwxNCA2NkwxNCA2NFpNODUgNjRMODUgNjVMODYgNjVMODYgNjRaTTIgNjVMMiA2NkwzIDY2TDMgNjVaTTIwIDY1TDIwIDY2TDIxIDY2TDIxIDY1Wk03MSA2NUw3MSA2Nkw3MyA2Nkw3MyA2NVpNNTcgNjZMNTcgNjdMNTggNjdMNTggNjZaTTQ3IDY3TDQ3IDY4TDQ4IDY4TDQ4IDY3Wk01MCA2N0w1MCA2OEw1MSA2OEw1MSA2N1pNNzAgNjdMNzAgNjlMNjkgNjlMNjkgNzBMNzAgNzBMNzAgNjlMNzEgNjlMNzEgNzBMNzMgNzBMNzMgNjlMNzQgNjlMNzQgNjhMNzMgNjhMNzMgNjlMNzEgNjlMNzEgNjhMNzIgNjhMNzIgNjdaTTc5IDY3TDc5IDY4TDgwIDY4TDgwIDY3Wk04MSA2N0w4MSA2OEw4MiA2OEw4MiA2N1pNMTIgNjhMMTIgNjlMMTMgNjlMMTMgNjhaTTE2IDY4TDE2IDY5TDE3IDY5TDE3IDcxTDE4IDcxTDE4IDczTDIwIDczTDIwIDY5TDE5IDY5TDE5IDcwTDE4IDcwTDE4IDY4Wk02IDY5TDYgNzBMNyA3MEw3IDY5Wk03OCA2OUw3OCA3MEw4MCA3MEw4MCA2OVpNODEgNjlMODEgNzBMODIgNzBMODIgNjlaTTgzIDY5TDgzIDcwTDg0IDcwTDg0IDcxTDgyIDcxTDgyIDczTDgxIDczTDgxIDc0TDgwIDc0TDgwIDc1TDc4IDc1TDc4IDc3TDc5IDc3TDc5IDc5TDc4IDc5TDc4IDgxTDc5IDgxTDc5IDg0TDgwIDg0TDgwIDgzTDgxIDgzTDgxIDgyTDgyIDgyTDgyIDgzTDgzIDgzTDgzIDgwTDgyIDgwTDgyIDc5TDgwIDc5TDgwIDc4TDgyIDc4TDgyIDc3TDgxIDc3TDgxIDc0TDgyIDc0TDgyIDczTDgzIDczTDgzIDc0TDg0IDc0TDg0IDczTDg2IDczTDg2IDcyTDg1IDcyTDg1IDY5Wk04NiA2OUw4NiA3MEw4NyA3MEw4NyA2OVpNMCA3MEwwIDcyTDIgNzJMMiA3MUwxIDcxTDEgNzBaTTI2IDcwTDI2IDcxTDI3IDcxTDI3IDcyTDI4IDcyTDI4IDcxTDI5IDcxTDI5IDcwWk01NiA3MEw1NiA3MUw1NyA3MUw1NyA3MFpNMzUgNzFMMzUgNzNMMzYgNzNMMzYgNzFaTTU4IDcxTDU4IDcyTDU5IDcyTDU5IDcxWk00IDcyTDQgNzNMNSA3M0w1IDc0TDcgNzRMNyA3M0w1IDczTDUgNzJaTTMyIDcyTDMyIDczTDMzIDczTDMzIDcyWk03MCA3Mkw3MCA3M0w3MiA3M0w3MiA3MlpNODMgNzJMODMgNzNMODQgNzNMODQgNzJaTTEwIDczTDEwIDc0TDggNzRMOCA3NUw2IDc1TDYgNzZMNSA3Nkw1IDc1TDQgNzVMNCA3NkwyIDc2TDIgNzdMMSA3N0wxIDc4TDIgNzhMMiA3OUw1IDc5TDUgNzhMNyA3OEw3IDc5TDYgNzlMNiA4MEw4IDgwTDggODFMOSA4MUw5IDgwTDggODBMOCA3OEw5IDc4TDkgNzlMMTAgNzlMMTAgNzhMMTIgNzhMMTIgNzdMOCA3N0w4IDc1TDkgNzVMOSA3NkwxMCA3NkwxMCA3NUwxMSA3NUwxMSA3NkwxMiA3NkwxMiA3NUwxMyA3NUwxMyA3NEwxMiA3NEwxMiA3M1pNNjMgNzNMNjMgNzRMNjQgNzRMNjQgNzNaTTExIDc0TDExIDc1TDEyIDc1TDEyIDc0Wk0xNiA3NEwxNiA3NUwxOCA3NUwxOCA3NFpNNTEgNzRMNTEgNzVMNDkgNzVMNDkgNzZMNDggNzZMNDggNzdMNDkgNzdMNDkgNzZMNTIgNzZMNTIgNzRaTTU1IDc0TDU1IDc2TDU2IDc2TDU2IDc0Wk03MyA3NEw3MyA3NUw3NCA3NUw3NCA3NFpNMjAgNzVMMjAgNzdMMjIgNzdMMjIgNzhMMjMgNzhMMjMgNzlMMjQgNzlMMjQgNzhMMjUgNzhMMjUgNzdMMjQgNzdMMjQgNzZMMjEgNzZMMjEgNzVaTTM5IDc1TDM5IDc2TDQwIDc2TDQwIDc4TDQyIDc4TDQyIDc3TDQxIDc3TDQxIDc2TDQwIDc2TDQwIDc1Wk01OCA3NUw1OCA3Nkw1OSA3Nkw1OSA3NVpNNjMgNzVMNjMgNzZMNjQgNzZMNjQgNzdMNjUgNzdMNjUgNzZMNjYgNzZMNjYgNzVaTTQgNzZMNCA3N0w1IDc3TDUgNzZaTTYgNzZMNiA3N0w3IDc3TDcgNzhMOCA3OEw4IDc3TDcgNzdMNyA3NlpNNzkgNzZMNzkgNzdMODAgNzdMODAgNzZaTTIgNzdMMiA3OEwzIDc4TDMgNzdaTTQzIDc3TDQzIDc5TDQyIDc5TDQyIDgwTDQzIDgwTDQzIDgxTDQyIDgxTDQyIDgyTDQzIDgyTDQzIDgxTDQ0IDgxTDQ0IDgyTDQ1IDgyTDQ1IDc5TDQ0IDc5TDQ0IDc3Wk04OCA3N0w4OCA3OEw4NyA3OEw4NyA3OUw5MSA3OUw5MSA3OEw5MCA3OEw5MCA3N1pNMTQgNzhMMTQgNzlMMTUgNzlMMTUgNzhaTTM4IDc4TDM4IDc5TDM5IDc5TDM5IDc4Wk02MCA3OEw2MCA3OUw2MSA3OUw2MSA3OFpNNzMgNzhMNzMgNzlMNzQgNzlMNzQgODBMNzUgODBMNzUgNzlMNzQgNzlMNzQgNzhaTTg0IDc4TDg0IDc5TDg1IDc5TDg1IDc4Wk0yNyA3OUwyNyA4MEwyNSA4MEwyNSA4MUwyNCA4MUwyNCA4M0wyNSA4M0wyNSA4MUwyNyA4MUwyNyA4MkwyOCA4MkwyOCA3OVpNNDAgNzlMNDAgODBMNDEgODBMNDEgNzlaTTc5IDc5TDc5IDgxTDgwIDgxTDgwIDgyTDgxIDgyTDgxIDgwTDgwIDgwTDgwIDc5Wk0zMiA4MEwzMiA4MkwzMyA4MkwzMyA4MFpNNTIgODBMNTIgODFMNTEgODFMNTEgODJMNTMgODJMNTMgODFMNTQgODFMNTQgODBaTTg0IDgwTDg0IDgxTDg1IDgxTDg1IDgwWk0xNSA4MUwxNSA4MkwxNCA4MkwxNCA4M0wxNSA4M0wxNSA4MkwxNiA4MkwxNiA4MVpNNjkgODFMNjkgODJMNzAgODJMNzAgODFaTTU3IDgyTDU3IDgzTDU4IDgzTDU4IDgyWk03NyA4Mkw3NyA4NEw3OCA4NEw3OCA4MlpNNiA4M0w2IDg0TDcgODRMNyA4M1pNMzYgODNMMzYgODRMMzcgODRMMzcgODNaTTcwIDg0TDcwIDg1TDcyIDg1TDcyIDg0Wk04OSA4NEw4OSA4Nkw5MCA4Nkw5MCA4NUw5MSA4NUw5MSA4NFpNMjkgODVMMjkgODhMMzIgODhMMzIgODVaTTU3IDg1TDU3IDg4TDYwIDg4TDYwIDg1Wk02MSA4NUw2MSA4Nkw2MyA4Nkw2MyA4NVpNODMgODVMODMgODZMODQgODZMODQgODVaTTg1IDg1TDg1IDg4TDg4IDg4TDg4IDg1Wk0xMyA4NkwxMyA4N0wxNCA4N0wxNCA4NlpNMjYgODZMMjYgODdMMjcgODdMMjcgODZaTTMwIDg2TDMwIDg3TDMxIDg3TDMxIDg2Wk0zNyA4NkwzNyA4N0wzOCA4N0wzOCA4NlpNNTMgODZMNTMgODdMNTQgODdMNTQgODhMNTUgODhMNTUgODlMNTQgODlMNTQgOTBMNTUgOTBMNTUgODlMNTYgODlMNTYgOTFMNTUgOTFMNTUgOTJMNTcgOTJMNTcgOTFMNTggOTFMNTggOTBMNTkgOTBMNTkgOTFMNjAgOTFMNjAgODlMNTYgODlMNTYgODdMNTQgODdMNTQgODZaTTU4IDg2TDU4IDg3TDU5IDg3TDU5IDg2Wk03NyA4Nkw3NyA4N0w3NiA4N0w3NiA4OEw3OCA4OEw3OCA4OUw3OSA4OUw3OSA4OEw4MCA4OEw4MCA4NlpNODYgODZMODYgODdMODcgODdMODcgODZaTTY2IDg3TDY2IDg4TDY1IDg4TDY1IDg5TDY3IDg5TDY3IDg3Wk02OCA4N0w2OCA4OUw2OSA4OUw2OSA5MEw3MCA5MEw3MCA4N1pNNzggODdMNzggODhMNzkgODhMNzkgODdaTTgxIDg3TDgxIDg4TDgyIDg4TDgyIDg3Wk04OSA4N0w4OSA4OUw5MCA4OUw5MCA4N1pNMTggODlMMTggOTJMMTkgOTJMMTkgODlaTTIwIDg5TDIwIDkwTDIyIDkwTDIyIDkxTDIwIDkxTDIwIDkyTDIyIDkyTDIyIDkxTDIzIDkxTDIzIDkwTDIyIDkwTDIyIDg5Wk04NiA4OUw4NiA5MEw4NyA5MEw4NyA4OVpNODAgOTBMODAgOTFMODEgOTFMODEgOTBaTTEyIDkxTDEyIDkyTDEzIDkyTDEzIDkxWk0wIDBMMCA3TDcgN0w3IDBaTTEgMUwxIDZMNiA2TDYgMVpNMiAyTDIgNUw1IDVMNSAyWk04NiAwTDg2IDdMOTMgN0w5MyAwWk04NyAxTDg3IDZMOTIgNkw5MiAxWk04OCAyTDg4IDVMOTEgNUw5MSAyWk0wIDg2TDAgOTNMNyA5M0w3IDg2Wk0xIDg3TDEgOTJMNiA5Mkw2IDg3Wk0yIDg4TDIgOTFMNSA5MUw1IDg4WiIgZmlsbD0iIzAwMDAwMCIvPjwvZz48L2c+PC9zdmc+Cg==	data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyIgPz4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+DQo8c3ZnIHdpZHRoPSIyMzciIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCAyMzcgODAiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCgk8ZGVzYz4wMDAwMDAxMzwvZGVzYz4NCgk8ZyBpZD0iYmFycyIgZmlsbD0icmdiKDAsMCwwKSIgc3Ryb2tlPSJub25lIj4NCgkJPHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjYiIGhlaWdodD0iODAiIC8+DQoJCTxyZWN0IHg9IjkiIHk9IjAiIHdpZHRoPSIzIiBoZWlnaHQ9IjgwIiAvPg0KCQk8cmVjdCB4PSIxOCIgeT0iMCIgd2lkdGg9IjkiIGhlaWdodD0iODAiIC8+DQoJCTxyZWN0IHg9IjMzIiB5PSIwIiB3aWR0aD0iNiIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iNDIiIHk9IjAiIHdpZHRoPSI2IiBoZWlnaHQ9IjgwIiAvPg0KCQk8cmVjdCB4PSI1NCIgeT0iMCIgd2lkdGg9IjYiIGhlaWdodD0iODAiIC8+DQoJCTxyZWN0IHg9IjY2IiB5PSIwIiB3aWR0aD0iNiIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iNzUiIHk9IjAiIHdpZHRoPSI2IiBoZWlnaHQ9IjgwIiAvPg0KCQk8cmVjdCB4PSI4NyIgeT0iMCIgd2lkdGg9IjYiIGhlaWdodD0iODAiIC8+DQoJCTxyZWN0IHg9Ijk5IiB5PSIwIiB3aWR0aD0iNiIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMTA4IiB5PSIwIiB3aWR0aD0iNiIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMTIwIiB5PSIwIiB3aWR0aD0iNiIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMTMyIiB5PSIwIiB3aWR0aD0iMyIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMTQxIiB5PSIwIiB3aWR0aD0iNiIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMTUwIiB5PSIwIiB3aWR0aD0iOSIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMTY1IiB5PSIwIiB3aWR0aD0iOSIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMTc3IiB5PSIwIiB3aWR0aD0iMyIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMTgzIiB5PSIwIiB3aWR0aD0iNiIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMTk4IiB5PSIwIiB3aWR0aD0iNiIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMjEzIiB5PSIwIiB3aWR0aD0iOSIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMjI1IiB5PSIwIiB3aWR0aD0iMyIgaGVpZ2h0PSI4MCIgLz4NCgkJPHJlY3QgeD0iMjMxIiB5PSIwIiB3aWR0aD0iNiIgaGVpZ2h0PSI4MCIgLz4NCgk8L2c+DQo8L3N2Zz4NCg==
\.


--
-- TOC entry 5183 (class 0 OID 43111)
-- Dependencies: 235
-- Data for Name: branch; Type: TABLE DATA; Schema: public; Owner: super_admin
--

COPY public.branch (id, branch_name, brak, brcode, created_at, updated_at) FROM stdin;
2	Main Office	MO	01	2025-12-12 07:08:16	2025-12-12 07:08:16
3	Jasaan Branch	JB	02	2025-12-12 07:10:01	2025-12-12 07:10:01
4	Salay Branch	SB	03	2025-12-12 07:10:15	2025-12-12 07:10:15
5	CDO Branch	CDOB	04	2025-12-12 07:11:17	2025-12-12 07:11:17
6	Maramag Branch	MB	05	2025-12-12 07:11:55	2025-12-12 07:11:55
7	Gingoog Branch Lite Unit	GNG-BLU	06	2025-12-12 07:12:41	2025-12-12 07:12:41
8	Camiguin Branch Lite Unit	CMG-BLU	07	2025-12-12 07:13:03	2025-12-12 07:13:03
9	Butuan Branch Lite Unit	BXU-BLU	08	2025-12-12 07:13:35	2025-12-12 07:13:35
10	Kibawe Branch Lite Unit	KIBAWE-BLU	09	2025-12-12 07:13:52	2025-12-12 07:13:52
11	Claveria Branch Lite Unit	Claveria-BLU	10	2025-12-12 07:14:16	2025-12-12 07:14:16
1	Head Office	HO	00	2025-12-12 07:08:06	2025-12-19 02:56:57
\.


--
-- TOC entry 5173 (class 0 OID 43020)
-- Dependencies: 225
-- Data for Name: cache; Type: TABLE DATA; Schema: public; Owner: super_admin
--

COPY public.cache (key, value, expiration) FROM stdin;
mis-cache-5c785c036466adea360111aa28563bfd556b5fba:timer	i:1767748233;	1767748233
mis-cache-5c785c036466adea360111aa28563bfd556b5fba	i:1;	1767748233
mis-cache-dashboard:branch_statistics:12	a:3:{s:7:"summary";a:11:{i:0;a:6:{s:9:"branch_id";i:9;s:11:"branch_name";s:23:"Butuan Branch Lite Unit";s:6:"brcode";s:2:"08";s:12:"total_assets";i:0;s:16:"total_book_value";d:0;s:22:"total_acquisition_cost";d:0;}i:1;a:6:{s:9:"branch_id";i:8;s:11:"branch_name";s:25:"Camiguin Branch Lite Unit";s:6:"brcode";s:2:"07";s:12:"total_assets";i:0;s:16:"total_book_value";d:0;s:22:"total_acquisition_cost";d:0;}i:2;a:6:{s:9:"branch_id";i:5;s:11:"branch_name";s:10:"CDO Branch";s:6:"brcode";s:2:"04";s:12:"total_assets";i:0;s:16:"total_book_value";d:0;s:22:"total_acquisition_cost";d:0;}i:3;a:6:{s:9:"branch_id";i:11;s:11:"branch_name";s:25:"Claveria Branch Lite Unit";s:6:"brcode";s:2:"10";s:12:"total_assets";i:0;s:16:"total_book_value";d:0;s:22:"total_acquisition_cost";d:0;}i:4;a:6:{s:9:"branch_id";i:7;s:11:"branch_name";s:24:"Gingoog Branch Lite Unit";s:6:"brcode";s:2:"06";s:12:"total_assets";i:0;s:16:"total_book_value";d:0;s:22:"total_acquisition_cost";d:0;}i:5;a:6:{s:9:"branch_id";i:1;s:11:"branch_name";s:11:"Head Office";s:6:"brcode";s:2:"00";s:12:"total_assets";i:10;s:16:"total_book_value";d:303344.88;s:22:"total_acquisition_cost";d:323600;}i:6;a:6:{s:9:"branch_id";i:3;s:11:"branch_name";s:13:"Jasaan Branch";s:6:"brcode";s:2:"02";s:12:"total_assets";i:0;s:16:"total_book_value";d:0;s:22:"total_acquisition_cost";d:0;}i:7;a:6:{s:9:"branch_id";i:10;s:11:"branch_name";s:23:"Kibawe Branch Lite Unit";s:6:"brcode";s:2:"09";s:12:"total_assets";i:0;s:16:"total_book_value";d:0;s:22:"total_acquisition_cost";d:0;}i:8;a:6:{s:9:"branch_id";i:2;s:11:"branch_name";s:11:"Main Office";s:6:"brcode";s:2:"01";s:12:"total_assets";i:0;s:16:"total_book_value";d:0;s:22:"total_acquisition_cost";d:0;}i:9;a:6:{s:9:"branch_id";i:6;s:11:"branch_name";s:14:"Maramag Branch";s:6:"brcode";s:2:"05";s:12:"total_assets";i:0;s:16:"total_book_value";d:0;s:22:"total_acquisition_cost";d:0;}i:10;a:6:{s:9:"branch_id";i:4;s:11:"branch_name";s:12:"Salay Branch";s:6:"brcode";s:2:"03";s:12:"total_assets";i:0;s:16:"total_book_value";d:0;s:22:"total_acquisition_cost";d:0;}}s:14:"monthly_trends";a:12:{i:0;a:3:{s:5:"month";s:8:"Feb 2025";s:9:"month_key";s:7:"2025-02";s:8:"branches";a:11:{s:11:"Main Office";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:13:"Jasaan Branch";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:12:"Salay Branch";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:10:"CDO Branch";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:14:"Maramag Branch";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:24:"Gingoog Branch Lite Unit";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:25:"Camiguin Branch Lite Unit";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:23:"Butuan Branch Lite Unit";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:23:"Kibawe Branch Lite Unit";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:25:"Claveria Branch Lite Unit";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:11:"Head Office";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}}}i:1;a:3:{s:5:"month";s:8:"Mar 2025";s:9:"month_key";s:7:"2025-03";s:8:"branches";a:11:{s:11:"Main Office";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:13:"Jasaan Branch";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:12:"Salay Branch";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:10:"CDO Branch";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:14:"Maramag Branch";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:24:"Gingoog Branch Lite Unit";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:25:"Camiguin Branch Lite Unit";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:23:"Butuan Branch Lite Unit";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:23:"Kibawe Branch Lite Unit";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:25:"Claveria Branch Lite Unit";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:11:"Head Office";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}}}i:2;a:3:{s:5:"month";s:8:"Apr 2025";s:9:"month_key";s:7:"2025-04";s:8:"branches";a:11:{s:11:"Main Office";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:13:"Jasaan Branch";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:12:"Salay Branch";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:10:"CDO Branch";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:14:"Maramag Branch";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:24:"Gingoog Branch Lite Unit";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:25:"Camiguin Branch Lite Unit";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:23:"Butuan Branch Lite Unit";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:23:"Kibawe Branch Lite Unit";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:25:"Claveria Branch Lite Unit";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:11:"Head Office";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}}}i:3;a:3:{s:5:"month";s:8:"May 2025";s:9:"month_key";s:7:"2025-05";s:8:"branches";a:11:{s:11:"Main Office";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:13:"Jasaan Branch";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:12:"Salay Branch";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:10:"CDO Branch";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:14:"Maramag Branch";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:24:"Gingoog Branch Lite Unit";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:25:"Camiguin Branch Lite Unit";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:23:"Butuan Branch Lite Unit";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:23:"Kibawe Branch Lite Unit";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:25:"Claveria Branch Lite Unit";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:11:"Head Office";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}}}i:4;a:3:{s:5:"month";s:8:"Jun 2025";s:9:"month_key";s:7:"2025-06";s:8:"branches";a:11:{s:11:"Main Office";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:13:"Jasaan Branch";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:12:"Salay Branch";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:10:"CDO Branch";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:14:"Maramag Branch";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:24:"Gingoog Branch Lite Unit";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:25:"Camiguin Branch Lite Unit";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:23:"Butuan Branch Lite Unit";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:23:"Kibawe Branch Lite Unit";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:25:"Claveria Branch Lite Unit";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:11:"Head Office";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}}}i:5;a:3:{s:5:"month";s:8:"Jul 2025";s:9:"month_key";s:7:"2025-07";s:8:"branches";a:11:{s:11:"Main Office";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:13:"Jasaan Branch";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:12:"Salay Branch";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:10:"CDO Branch";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:14:"Maramag Branch";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:24:"Gingoog Branch Lite Unit";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:25:"Camiguin Branch Lite Unit";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:23:"Butuan Branch Lite Unit";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:23:"Kibawe Branch Lite Unit";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:25:"Claveria Branch Lite Unit";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:11:"Head Office";a:5:{s:16:"acquisition_cost";d:4500;s:11:"asset_count";i:1;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:4500;}}}i:6;a:3:{s:5:"month";s:8:"Aug 2025";s:9:"month_key";s:7:"2025-08";s:8:"branches";a:11:{s:11:"Main Office";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:13:"Jasaan Branch";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:12:"Salay Branch";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:10:"CDO Branch";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:14:"Maramag Branch";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:24:"Gingoog Branch Lite Unit";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:25:"Camiguin Branch Lite Unit";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:23:"Butuan Branch Lite Unit";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:23:"Kibawe Branch Lite Unit";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:25:"Claveria Branch Lite Unit";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:11:"Head Office";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}}}i:7;a:3:{s:5:"month";s:8:"Sep 2025";s:9:"month_key";s:7:"2025-09";s:8:"branches";a:11:{s:11:"Main Office";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:13:"Jasaan Branch";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:12:"Salay Branch";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:10:"CDO Branch";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:14:"Maramag Branch";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:24:"Gingoog Branch Lite Unit";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:25:"Camiguin Branch Lite Unit";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:23:"Butuan Branch Lite Unit";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:23:"Kibawe Branch Lite Unit";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:25:"Claveria Branch Lite Unit";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:11:"Head Office";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}}}i:8;a:3:{s:5:"month";s:8:"Oct 2025";s:9:"month_key";s:7:"2025-10";s:8:"branches";a:11:{s:11:"Main Office";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:13:"Jasaan Branch";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:12:"Salay Branch";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:10:"CDO Branch";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:14:"Maramag Branch";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:24:"Gingoog Branch Lite Unit";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:25:"Camiguin Branch Lite Unit";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:23:"Butuan Branch Lite Unit";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:23:"Kibawe Branch Lite Unit";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:25:"Claveria Branch Lite Unit";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:11:"Head Office";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}}}i:9;a:3:{s:5:"month";s:8:"Nov 2025";s:9:"month_key";s:7:"2025-11";s:8:"branches";a:11:{s:11:"Main Office";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:13:"Jasaan Branch";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:12:"Salay Branch";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:10:"CDO Branch";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:14:"Maramag Branch";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:24:"Gingoog Branch Lite Unit";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:25:"Camiguin Branch Lite Unit";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:23:"Butuan Branch Lite Unit";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:23:"Kibawe Branch Lite Unit";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:25:"Claveria Branch Lite Unit";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:11:"Head Office";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}}}i:10;a:3:{s:5:"month";s:8:"Dec 2025";s:9:"month_key";s:7:"2025-12";s:8:"branches";a:11:{s:11:"Main Office";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:13:"Jasaan Branch";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:12:"Salay Branch";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:10:"CDO Branch";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:14:"Maramag Branch";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:24:"Gingoog Branch Lite Unit";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:25:"Camiguin Branch Lite Unit";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:23:"Butuan Branch Lite Unit";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:23:"Kibawe Branch Lite Unit";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:25:"Claveria Branch Lite Unit";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:11:"Head Office";a:5:{s:16:"acquisition_cost";d:270000;s:11:"asset_count";i:4;s:11:"repair_cost";d:16200;s:12:"repair_count";i:2;s:13:"total_expense";d:286200;}}}i:11;a:3:{s:5:"month";s:8:"Jan 2026";s:9:"month_key";s:7:"2026-01";s:8:"branches";a:11:{s:11:"Main Office";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:13:"Jasaan Branch";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:12:"Salay Branch";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:10:"CDO Branch";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:14:"Maramag Branch";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:24:"Gingoog Branch Lite Unit";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:25:"Camiguin Branch Lite Unit";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:23:"Butuan Branch Lite Unit";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:23:"Kibawe Branch Lite Unit";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:25:"Claveria Branch Lite Unit";a:5:{s:16:"acquisition_cost";d:0;s:11:"asset_count";i:0;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:0;}s:11:"Head Office";a:5:{s:16:"acquisition_cost";d:18000;s:11:"asset_count";i:1;s:11:"repair_cost";d:0;s:12:"repair_count";i:0;s:13:"total_expense";d:18000;}}}}s:16:"status_breakdown";a:1:{i:0;a:2:{s:11:"branch_name";s:11:"Head Office";s:8:"statuses";a:3:{i:0;a:3:{s:6:"status";s:10:"Functional";s:5:"color";s:7:"#3B82F6";s:5:"count";i:2;}i:1;a:3:{s:6:"status";s:3:"New";s:5:"color";s:7:"#068e36";s:5:"count";i:6;}i:2;a:3:{s:6:"status";s:12:"Under Repair";s:5:"color";s:7:"#cdd01b";s:5:"count";i:2;}}}}}	1767748480
mis-cache-dashboard:monthly_expenses:2025	a:12:{i:0;a:5:{s:5:"month";s:8:"Jan 2025";s:9:"month_key";s:7:"2025-01";s:16:"acquisition_cost";d:0;s:11:"repair_cost";d:0;s:10:"total_cost";d:0;}i:1;a:5:{s:5:"month";s:8:"Feb 2025";s:9:"month_key";s:7:"2025-02";s:16:"acquisition_cost";d:0;s:11:"repair_cost";d:0;s:10:"total_cost";d:0;}i:2;a:5:{s:5:"month";s:8:"Mar 2025";s:9:"month_key";s:7:"2025-03";s:16:"acquisition_cost";d:0;s:11:"repair_cost";d:0;s:10:"total_cost";d:0;}i:3;a:5:{s:5:"month";s:8:"Apr 2025";s:9:"month_key";s:7:"2025-04";s:16:"acquisition_cost";d:0;s:11:"repair_cost";d:0;s:10:"total_cost";d:0;}i:4;a:5:{s:5:"month";s:8:"May 2025";s:9:"month_key";s:7:"2025-05";s:16:"acquisition_cost";d:0;s:11:"repair_cost";d:0;s:10:"total_cost";d:0;}i:5;a:5:{s:5:"month";s:8:"Jun 2025";s:9:"month_key";s:7:"2025-06";s:16:"acquisition_cost";d:0;s:11:"repair_cost";d:0;s:10:"total_cost";d:0;}i:6;a:5:{s:5:"month";s:8:"Jul 2025";s:9:"month_key";s:7:"2025-07";s:16:"acquisition_cost";d:4500;s:11:"repair_cost";d:0;s:10:"total_cost";d:4500;}i:7;a:5:{s:5:"month";s:8:"Aug 2025";s:9:"month_key";s:7:"2025-08";s:16:"acquisition_cost";d:0;s:11:"repair_cost";d:0;s:10:"total_cost";d:0;}i:8;a:5:{s:5:"month";s:8:"Sep 2025";s:9:"month_key";s:7:"2025-09";s:16:"acquisition_cost";d:0;s:11:"repair_cost";d:0;s:10:"total_cost";d:0;}i:9;a:5:{s:5:"month";s:8:"Oct 2025";s:9:"month_key";s:7:"2025-10";s:16:"acquisition_cost";d:0;s:11:"repair_cost";d:0;s:10:"total_cost";d:0;}i:10;a:5:{s:5:"month";s:8:"Nov 2025";s:9:"month_key";s:7:"2025-11";s:16:"acquisition_cost";d:0;s:11:"repair_cost";d:0;s:10:"total_cost";d:0;}i:11;a:5:{s:5:"month";s:8:"Dec 2025";s:9:"month_key";s:7:"2025-12";s:16:"acquisition_cost";d:270000;s:11:"repair_cost";d:16200;s:10:"total_cost";d:286200;}}	1767000002
\.


--
-- TOC entry 5174 (class 0 OID 43030)
-- Dependencies: 226
-- Data for Name: cache_locks; Type: TABLE DATA; Schema: public; Owner: super_admin
--

COPY public.cache_locks (key, owner, expiration) FROM stdin;
\.


--
-- TOC entry 5193 (class 0 OID 43160)
-- Dependencies: 245
-- Data for Name: employee; Type: TABLE DATA; Schema: public; Owner: super_admin
--

COPY public.employee (id, fullname, branch_id, department_id, position_id, created_at, updated_at) FROM stdin;
1	Augustin Maputol	1	1	1	2025-12-12 08:10:06	2025-12-12 08:10:06
2	Deserie Imy C. Quidet	1	1	2	2025-12-12 08:10:43	2025-12-12 08:10:43
3	Bryan Abelo	1	1	1	2025-12-15 05:31:51	2025-12-15 05:31:51
4	Pepito V. Vacalares	1	1	3	2025-12-15 05:32:17	2025-12-15 05:32:17
5	Ivy Marie C. Mabale	1	5	9	2025-12-19 03:05:20	2025-12-19 03:05:44
\.


--
-- TOC entry 5179 (class 0 OID 43071)
-- Dependencies: 231
-- Data for Name: failed_jobs; Type: TABLE DATA; Schema: public; Owner: super_admin
--

COPY public.failed_jobs (id, uuid, connection, queue, payload, exception, failed_at) FROM stdin;
\.


--
-- TOC entry 5177 (class 0 OID 43056)
-- Dependencies: 229
-- Data for Name: job_batches; Type: TABLE DATA; Schema: public; Owner: super_admin
--

COPY public.job_batches (id, name, total_jobs, pending_jobs, failed_jobs, failed_job_ids, options, cancelled_at, created_at, finished_at) FROM stdin;
\.


--
-- TOC entry 5176 (class 0 OID 43041)
-- Dependencies: 228
-- Data for Name: jobs; Type: TABLE DATA; Schema: public; Owner: super_admin
--

COPY public.jobs (id, queue, payload, attempts, reserved_at, available_at, created_at) FROM stdin;
\.


--
-- TOC entry 5168 (class 0 OID 42729)
-- Dependencies: 220
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: super_admin
--

COPY public.migrations (id, migration, batch) FROM stdin;
14	0001_01_01_000000_create_users_table	1
15	0001_01_01_000001_create_cache_table	1
16	0001_01_01_000002_create_jobs_table	1
17	2025_12_10_043412_create_personal_access_tokens_table	1
18	2025_12_10_130000_add_username_to_users_table	1
19	2025_12_12_012033_create_branch	1
20	2025_12_12_012217_create_position	1
21	2025_12_12_012351_create_section	1
22	2025_12_12_013041_create_status	1
23	2025_12_12_013332_create_asset_category	1
24	2025_12_12_013600_create_employee	1
25	2025_12_12_012612_create_vendors	2
26	2025_12_12_013800_create_assets	2
27	2025_12_18_024627_add_qr_code_to_assets_table	3
28	2025_12_18_034615_add_color_to_status_table	4
29	2025_12_18_120000_add_code_to_asset_category_table	5
30	2025_12_18_131000_make_warranty_expiration_nullable_on_assets_table	6
31	2025_12_18_060418_add_barcode_to_assets_table	7
32	2025_12_18_070015_create_repairs_table	8
33	2025_12_18_071411_remove_technician_fields_from_repairs_table	9
35	2025_12_19_000000_create_asset_movements_table	10
36	2025_12_19_000001_backfill_asset_movements	10
38	2025_12_26_000000_add_new_movement_types_to_asset_movements	11
39	2025_12_26_100000_add_status_change_fields_to_repairs_table	11
40	2025_12_26_110000_add_branch_delivery_to_repairs	12
41	2025_12_26_120000_add_employee_name_to_repairs	13
42	2025_12_26_060750_create_repair_remarks_table	14
43	2025_12_26_065506_add_repair_movement_types_to_asset_movements_table	15
\.


--
-- TOC entry 5171 (class 0 OID 42999)
-- Dependencies: 223
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: super_admin
--

COPY public.password_reset_tokens (email, token, created_at) FROM stdin;
\.


--
-- TOC entry 5181 (class 0 OID 43090)
-- Dependencies: 233
-- Data for Name: personal_access_tokens; Type: TABLE DATA; Schema: public; Owner: super_admin
--

COPY public.personal_access_tokens (id, tokenable_type, tokenable_id, name, token, abilities, last_used_at, expires_at, created_at, updated_at) FROM stdin;
20	App\\Models\\User	1	auth_token	1e3ab084f7266663a48f30f1f0bf974561d0f2ee86386e7e45dce3d08aba7432	["*"]	2026-01-07 01:25:25	2026-01-14 01:09:34	2026-01-07 01:09:34	2026-01-07 01:25:25
\.


--
-- TOC entry 5185 (class 0 OID 43124)
-- Dependencies: 237
-- Data for Name: position; Type: TABLE DATA; Schema: public; Owner: super_admin
--

COPY public."position" (id, title, created_at, updated_at) FROM stdin;
1	MIS Assistant	2025-12-12 06:53:59	2025-12-12 06:53:59
2	MIS Supervisor	2025-12-12 06:54:14	2025-12-12 06:54:14
3	MIS Manager	2025-12-12 06:54:29	2025-12-12 06:54:29
4	Compliance Head	2025-12-12 06:54:55	2025-12-12 06:54:55
5	HR Manager	2025-12-12 06:55:13	2025-12-12 06:55:13
6	Business Development Officer	2025-12-12 06:55:33	2025-12-12 06:55:33
7	MFU Manager	2025-12-12 06:55:53	2025-12-12 06:55:53
8	MFU Assistant	2025-12-12 06:56:10	2025-12-12 06:56:10
9	Compliance Specialist	2025-12-12 06:56:28	2025-12-12 06:56:28
10	HR Associate	2025-12-12 06:56:52	2025-12-12 06:56:52
11	HR Supervisor	2025-12-12 06:57:08	2025-12-12 06:57:08
12	RAM Supervisor	2025-12-12 06:57:24	2025-12-12 06:57:24
13	Audit	2025-12-12 06:59:10	2025-12-12 06:59:10
14	Audit Manager	2025-12-12 06:59:20	2025-12-12 06:59:20
15	SME Account Assistant	2025-12-12 06:59:34	2025-12-12 06:59:34
16	Accounting Clerk	2025-12-12 06:59:46	2025-12-12 06:59:46
17	SME Account Officer	2025-12-12 06:59:58	2025-12-12 06:59:58
18	Branch Manager	2025-12-12 07:00:51	2025-12-12 07:00:51
19	Cashier	2025-12-12 07:00:59	2025-12-12 07:00:59
20	Teller	2025-12-12 07:01:06	2025-12-12 07:01:06
21	Customer Associate	2025-12-12 07:01:13	2025-12-12 07:01:13
22	General Bookkeeper	2025-12-12 07:01:26	2025-12-12 07:01:26
23	Loans Bookkeeper	2025-12-12 07:01:37	2025-12-12 07:01:37
24	Loan Processor	2025-12-12 07:01:49	2025-12-12 07:01:49
25	Account Officer	2025-12-12 07:01:59	2025-12-12 07:01:59
26	Loan Officer	2025-12-12 07:02:20	2025-12-12 07:02:20
27	Branch Lite Head	2025-12-12 07:02:38	2025-12-12 07:02:38
28	Office Associate	2025-12-12 07:02:51	2025-12-12 07:02:51
29	Loan Supervisor	2025-12-12 07:03:21	2025-12-12 07:03:21
30	MFU Loan Supervisor	2025-12-12 07:03:47	2025-12-12 07:03:47
\.


--
-- TOC entry 5203 (class 0 OID 50479)
-- Dependencies: 255
-- Data for Name: repair_remarks; Type: TABLE DATA; Schema: public; Owner: super_admin
--

COPY public.repair_remarks (id, repair_id, remark, remark_type, created_at, updated_at) FROM stdin;
1	2	still in the bank	pending_reason	2025-12-26 06:38:47	2025-12-26 06:38:47
2	2	waiting for PO approved	pending_reason	2025-12-26 06:45:05	2025-12-26 06:45:05
3	2	waiting for PO approved	pending_reason	2025-12-26 06:45:20	2025-12-26 06:45:20
4	2	still process the PO	pending_reason	2025-12-26 06:48:14	2025-12-26 06:48:14
5	2	Test remark	general	2025-12-26 06:53:56	2025-12-26 06:53:56
6	2	still process the PO	pending_reason	2025-12-26 06:58:00	2025-12-26 06:58:00
7	2	testing	general	2025-12-26 06:58:31	2025-12-26 06:58:31
8	2	Test remark after migration	general	2025-12-26 07:01:10	2025-12-26 07:01:10
9	2	test	general	2025-12-26 07:01:49	2025-12-26 07:01:49
10	2	testing	pending_reason	2025-12-26 07:02:00	2025-12-26 07:02:00
\.


--
-- TOC entry 5199 (class 0 OID 50295)
-- Dependencies: 251
-- Data for Name: repairs; Type: TABLE DATA; Schema: public; Owner: super_admin
--

COPY public.repairs (id, asset_id, vendor_id, description, repair_date, expected_return_date, actual_return_date, repair_cost, status, remarks, created_at, updated_at, invoice_no, completion_description, job_order_path, delivered_by_employee_id, delivered_by_type, delivered_by_branch_id, delivered_by_employee_name) FROM stdin;
1	8	1	No display LCD defective	2025-12-23	2025-12-30	2025-12-26	15000.00	Returned	\N	2025-12-23 02:16:57	2025-12-26 01:08:00	\N	\N	\N	\N	\N	\N	\N
2	6	1	No longer charging	2025-12-26	2026-01-06	\N	1200.00	Completed	\N	2025-12-26 03:03:18	2025-12-29 03:26:52	\N	\N	job_orders/job_order_2_1766977015.jpg	\N	branch	3	\N
\.


--
-- TOC entry 5187 (class 0 OID 43133)
-- Dependencies: 239
-- Data for Name: section; Type: TABLE DATA; Schema: public; Owner: super_admin
--

COPY public.section (id, name, created_at, updated_at) FROM stdin;
1	MIS	2025-12-12 07:06:02	2025-12-12 07:06:02
2	Accounting	2025-12-12 07:06:11	2025-12-12 07:06:11
3	HR	2025-12-12 07:06:20	2025-12-12 07:06:20
4	Audit	2025-12-12 07:06:27	2025-12-12 07:06:27
5	Compliance	2025-12-12 07:06:45	2025-12-12 07:06:45
6	SME	2025-12-12 07:07:17	2025-12-12 07:07:17
7	Loans Section	2025-12-12 07:07:41	2025-12-12 07:07:41
8	Cash Section	2025-12-12 07:07:51	2025-12-12 07:07:51
\.


--
-- TOC entry 5172 (class 0 OID 43008)
-- Dependencies: 224
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: super_admin
--

COPY public.sessions (id, user_id, ip_address, user_agent, payload, last_activity) FROM stdin;
\.


--
-- TOC entry 5189 (class 0 OID 43142)
-- Dependencies: 241
-- Data for Name: status; Type: TABLE DATA; Schema: public; Owner: super_admin
--

COPY public.status (id, name, created_at, updated_at, color) FROM stdin;
2	Functional	2025-12-12 06:38:15	2025-12-12 06:38:15	#3B82F6
3	Defective	2025-12-12 07:19:17	2025-12-18 05:03:24	#fa0000
4	Standby	2025-12-12 07:19:22	2025-12-18 07:15:15	#f7c53b
1	New	2025-12-12 06:38:04	2025-12-18 08:31:39	#068e36
5	Under Repair	2025-12-12 07:19:39	2025-12-18 08:52:42	#cdd01b
\.


--
-- TOC entry 5170 (class 0 OID 42985)
-- Dependencies: 222
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: super_admin
--

COPY public.users (id, name, email, email_verified_at, password, remember_token, created_at, updated_at, username) FROM stdin;
1	Augustin Maputol	cloudsephiroth56@gmail.com	\N	$2y$12$6V1e6kB3sHex0rjza7sLoub5U4QvxeNsDcE.atD/oOCS0tHCdjLKK	\N	2025-12-12 06:33:11	2025-12-12 06:33:11	maps
\.


--
-- TOC entry 5195 (class 0 OID 43205)
-- Dependencies: 247
-- Data for Name: vendors; Type: TABLE DATA; Schema: public; Owner: super_admin
--

COPY public.vendors (id, company_name, contact_no, address, created_at, updated_at) FROM stdin;
1	Mastertech	09268361342	CDO	2025-12-12 06:33:26	2025-12-12 06:33:26
2	Gaisano Interpace	09268361344	CDO	2025-12-15 05:33:03	2025-12-15 05:33:03
\.


--
-- TOC entry 5228 (class 0 OID 0)
-- Dependencies: 242
-- Name: asset_category_id_seq; Type: SEQUENCE SET; Schema: public; Owner: super_admin
--

SELECT pg_catalog.setval('public.asset_category_id_seq', 7, true);


--
-- TOC entry 5229 (class 0 OID 0)
-- Dependencies: 252
-- Name: asset_movements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: super_admin
--

SELECT pg_catalog.setval('public.asset_movements_id_seq', 63, true);


--
-- TOC entry 5230 (class 0 OID 0)
-- Dependencies: 248
-- Name: assets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: super_admin
--

SELECT pg_catalog.setval('public.assets_id_seq', 15, true);


--
-- TOC entry 5231 (class 0 OID 0)
-- Dependencies: 234
-- Name: branch_id_seq; Type: SEQUENCE SET; Schema: public; Owner: super_admin
--

SELECT pg_catalog.setval('public.branch_id_seq', 12, true);


--
-- TOC entry 5232 (class 0 OID 0)
-- Dependencies: 244
-- Name: employee_id_seq; Type: SEQUENCE SET; Schema: public; Owner: super_admin
--

SELECT pg_catalog.setval('public.employee_id_seq', 5, true);


--
-- TOC entry 5233 (class 0 OID 0)
-- Dependencies: 230
-- Name: failed_jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: super_admin
--

SELECT pg_catalog.setval('public.failed_jobs_id_seq', 1, false);


--
-- TOC entry 5234 (class 0 OID 0)
-- Dependencies: 227
-- Name: jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: super_admin
--

SELECT pg_catalog.setval('public.jobs_id_seq', 1, false);


--
-- TOC entry 5235 (class 0 OID 0)
-- Dependencies: 219
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: super_admin
--

SELECT pg_catalog.setval('public.migrations_id_seq', 43, true);


--
-- TOC entry 5236 (class 0 OID 0)
-- Dependencies: 232
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: super_admin
--

SELECT pg_catalog.setval('public.personal_access_tokens_id_seq', 20, true);


--
-- TOC entry 5237 (class 0 OID 0)
-- Dependencies: 236
-- Name: position_id_seq; Type: SEQUENCE SET; Schema: public; Owner: super_admin
--

SELECT pg_catalog.setval('public.position_id_seq', 30, true);


--
-- TOC entry 5238 (class 0 OID 0)
-- Dependencies: 254
-- Name: repair_remarks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: super_admin
--

SELECT pg_catalog.setval('public.repair_remarks_id_seq', 10, true);


--
-- TOC entry 5239 (class 0 OID 0)
-- Dependencies: 250
-- Name: repairs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: super_admin
--

SELECT pg_catalog.setval('public.repairs_id_seq', 2, true);


--
-- TOC entry 5240 (class 0 OID 0)
-- Dependencies: 238
-- Name: section_id_seq; Type: SEQUENCE SET; Schema: public; Owner: super_admin
--

SELECT pg_catalog.setval('public.section_id_seq', 9, true);


--
-- TOC entry 5241 (class 0 OID 0)
-- Dependencies: 240
-- Name: status_id_seq; Type: SEQUENCE SET; Schema: public; Owner: super_admin
--

SELECT pg_catalog.setval('public.status_id_seq', 5, true);


--
-- TOC entry 5242 (class 0 OID 0)
-- Dependencies: 221
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: super_admin
--

SELECT pg_catalog.setval('public.users_id_seq', 1, true);


--
-- TOC entry 5243 (class 0 OID 0)
-- Dependencies: 246
-- Name: vendors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: super_admin
--

SELECT pg_catalog.setval('public.vendors_id_seq', 2, true);


--
-- TOC entry 4969 (class 2606 OID 50292)
-- Name: asset_category asset_category_code_unique; Type: CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.asset_category
    ADD CONSTRAINT asset_category_code_unique UNIQUE (code);


--
-- TOC entry 4971 (class 2606 OID 43158)
-- Name: asset_category asset_category_pkey; Type: CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.asset_category
    ADD CONSTRAINT asset_category_pkey PRIMARY KEY (id);


--
-- TOC entry 4992 (class 2606 OID 50406)
-- Name: asset_movements asset_movements_pkey; Type: CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.asset_movements
    ADD CONSTRAINT asset_movements_pkey PRIMARY KEY (id);


--
-- TOC entry 4977 (class 2606 OID 43229)
-- Name: assets assets_pkey; Type: CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_pkey PRIMARY KEY (id);


--
-- TOC entry 4961 (class 2606 OID 43122)
-- Name: branch branch_pkey; Type: CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.branch
    ADD CONSTRAINT branch_pkey PRIMARY KEY (id);


--
-- TOC entry 4944 (class 2606 OID 43039)
-- Name: cache_locks cache_locks_pkey; Type: CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.cache_locks
    ADD CONSTRAINT cache_locks_pkey PRIMARY KEY (key);


--
-- TOC entry 4942 (class 2606 OID 43029)
-- Name: cache cache_pkey; Type: CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.cache
    ADD CONSTRAINT cache_pkey PRIMARY KEY (key);


--
-- TOC entry 4973 (class 2606 OID 43170)
-- Name: employee employee_pkey; Type: CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.employee
    ADD CONSTRAINT employee_pkey PRIMARY KEY (id);


--
-- TOC entry 4951 (class 2606 OID 43086)
-- Name: failed_jobs failed_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_pkey PRIMARY KEY (id);


--
-- TOC entry 4953 (class 2606 OID 43088)
-- Name: failed_jobs failed_jobs_uuid_unique; Type: CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_uuid_unique UNIQUE (uuid);


--
-- TOC entry 4949 (class 2606 OID 43069)
-- Name: job_batches job_batches_pkey; Type: CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.job_batches
    ADD CONSTRAINT job_batches_pkey PRIMARY KEY (id);


--
-- TOC entry 4946 (class 2606 OID 43054)
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- TOC entry 4928 (class 2606 OID 42737)
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 4936 (class 2606 OID 43007)
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (email);


--
-- TOC entry 4956 (class 2606 OID 43102)
-- Name: personal_access_tokens personal_access_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.personal_access_tokens
    ADD CONSTRAINT personal_access_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 4958 (class 2606 OID 43105)
-- Name: personal_access_tokens personal_access_tokens_token_unique; Type: CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.personal_access_tokens
    ADD CONSTRAINT personal_access_tokens_token_unique UNIQUE (token);


--
-- TOC entry 4963 (class 2606 OID 43131)
-- Name: position position_pkey; Type: CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public."position"
    ADD CONSTRAINT position_pkey PRIMARY KEY (id);


--
-- TOC entry 4997 (class 2606 OID 50491)
-- Name: repair_remarks repair_remarks_pkey; Type: CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.repair_remarks
    ADD CONSTRAINT repair_remarks_pkey PRIMARY KEY (id);


--
-- TOC entry 4982 (class 2606 OID 50312)
-- Name: repairs repairs_pkey; Type: CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.repairs
    ADD CONSTRAINT repairs_pkey PRIMARY KEY (id);


--
-- TOC entry 4965 (class 2606 OID 43140)
-- Name: section section_pkey; Type: CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.section
    ADD CONSTRAINT section_pkey PRIMARY KEY (id);


--
-- TOC entry 4939 (class 2606 OID 43017)
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- TOC entry 4967 (class 2606 OID 43149)
-- Name: status status_pkey; Type: CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.status
    ADD CONSTRAINT status_pkey PRIMARY KEY (id);


--
-- TOC entry 4930 (class 2606 OID 42998)
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- TOC entry 4932 (class 2606 OID 42996)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4934 (class 2606 OID 43109)
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- TOC entry 4975 (class 2606 OID 43216)
-- Name: vendors vendors_pkey; Type: CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_pkey PRIMARY KEY (id);


--
-- TOC entry 4986 (class 1259 OID 50452)
-- Name: asset_movements_asset_id_index; Type: INDEX; Schema: public; Owner: super_admin
--

CREATE INDEX asset_movements_asset_id_index ON public.asset_movements USING btree (asset_id);


--
-- TOC entry 4987 (class 1259 OID 50455)
-- Name: asset_movements_asset_id_movement_date_index; Type: INDEX; Schema: public; Owner: super_admin
--

CREATE INDEX asset_movements_asset_id_movement_date_index ON public.asset_movements USING btree (asset_id, movement_date);


--
-- TOC entry 4988 (class 1259 OID 50456)
-- Name: asset_movements_from_employee_id_index; Type: INDEX; Schema: public; Owner: super_admin
--

CREATE INDEX asset_movements_from_employee_id_index ON public.asset_movements USING btree (from_employee_id);


--
-- TOC entry 4989 (class 1259 OID 50454)
-- Name: asset_movements_movement_date_index; Type: INDEX; Schema: public; Owner: super_admin
--

CREATE INDEX asset_movements_movement_date_index ON public.asset_movements USING btree (movement_date);


--
-- TOC entry 4990 (class 1259 OID 50453)
-- Name: asset_movements_movement_type_index; Type: INDEX; Schema: public; Owner: super_admin
--

CREATE INDEX asset_movements_movement_type_index ON public.asset_movements USING btree (movement_type);


--
-- TOC entry 4993 (class 1259 OID 50457)
-- Name: asset_movements_to_employee_id_index; Type: INDEX; Schema: public; Owner: super_admin
--

CREATE INDEX asset_movements_to_employee_id_index ON public.asset_movements USING btree (to_employee_id);


--
-- TOC entry 4994 (class 1259 OID 50458)
-- Name: asset_movements_to_status_id_index; Type: INDEX; Schema: public; Owner: super_admin
--

CREATE INDEX asset_movements_to_status_id_index ON public.asset_movements USING btree (to_status_id);


--
-- TOC entry 4947 (class 1259 OID 43055)
-- Name: jobs_queue_index; Type: INDEX; Schema: public; Owner: super_admin
--

CREATE INDEX jobs_queue_index ON public.jobs USING btree (queue);


--
-- TOC entry 4954 (class 1259 OID 43106)
-- Name: personal_access_tokens_expires_at_index; Type: INDEX; Schema: public; Owner: super_admin
--

CREATE INDEX personal_access_tokens_expires_at_index ON public.personal_access_tokens USING btree (expires_at);


--
-- TOC entry 4959 (class 1259 OID 43103)
-- Name: personal_access_tokens_tokenable_type_tokenable_id_index; Type: INDEX; Schema: public; Owner: super_admin
--

CREATE INDEX personal_access_tokens_tokenable_type_tokenable_id_index ON public.personal_access_tokens USING btree (tokenable_type, tokenable_id);


--
-- TOC entry 4995 (class 1259 OID 50498)
-- Name: repair_remarks_created_at_index; Type: INDEX; Schema: public; Owner: super_admin
--

CREATE INDEX repair_remarks_created_at_index ON public.repair_remarks USING btree (created_at);


--
-- TOC entry 4998 (class 1259 OID 50497)
-- Name: repair_remarks_repair_id_index; Type: INDEX; Schema: public; Owner: super_admin
--

CREATE INDEX repair_remarks_repair_id_index ON public.repair_remarks USING btree (repair_id);


--
-- TOC entry 4978 (class 1259 OID 50323)
-- Name: repairs_asset_id_index; Type: INDEX; Schema: public; Owner: super_admin
--

CREATE INDEX repairs_asset_id_index ON public.repairs USING btree (asset_id);


--
-- TOC entry 4979 (class 1259 OID 50477)
-- Name: repairs_delivered_by_branch_id_index; Type: INDEX; Schema: public; Owner: super_admin
--

CREATE INDEX repairs_delivered_by_branch_id_index ON public.repairs USING btree (delivered_by_branch_id);


--
-- TOC entry 4980 (class 1259 OID 50469)
-- Name: repairs_delivered_by_employee_id_index; Type: INDEX; Schema: public; Owner: super_admin
--

CREATE INDEX repairs_delivered_by_employee_id_index ON public.repairs USING btree (delivered_by_employee_id);


--
-- TOC entry 4983 (class 1259 OID 50326)
-- Name: repairs_repair_date_index; Type: INDEX; Schema: public; Owner: super_admin
--

CREATE INDEX repairs_repair_date_index ON public.repairs USING btree (repair_date);


--
-- TOC entry 4984 (class 1259 OID 50325)
-- Name: repairs_status_index; Type: INDEX; Schema: public; Owner: super_admin
--

CREATE INDEX repairs_status_index ON public.repairs USING btree (status);


--
-- TOC entry 4985 (class 1259 OID 50324)
-- Name: repairs_vendor_id_index; Type: INDEX; Schema: public; Owner: super_admin
--

CREATE INDEX repairs_vendor_id_index ON public.repairs USING btree (vendor_id);


--
-- TOC entry 4937 (class 1259 OID 43019)
-- Name: sessions_last_activity_index; Type: INDEX; Schema: public; Owner: super_admin
--

CREATE INDEX sessions_last_activity_index ON public.sessions USING btree (last_activity);


--
-- TOC entry 4940 (class 1259 OID 43018)
-- Name: sessions_user_id_index; Type: INDEX; Schema: public; Owner: super_admin
--

CREATE INDEX sessions_user_id_index ON public.sessions USING btree (user_id);


--
-- TOC entry 5010 (class 2606 OID 50407)
-- Name: asset_movements asset_movements_asset_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.asset_movements
    ADD CONSTRAINT asset_movements_asset_id_foreign FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;


--
-- TOC entry 5011 (class 2606 OID 50432)
-- Name: asset_movements asset_movements_from_branch_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.asset_movements
    ADD CONSTRAINT asset_movements_from_branch_id_foreign FOREIGN KEY (from_branch_id) REFERENCES public.branch(id) ON DELETE SET NULL;


--
-- TOC entry 5012 (class 2606 OID 50412)
-- Name: asset_movements asset_movements_from_employee_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.asset_movements
    ADD CONSTRAINT asset_movements_from_employee_id_foreign FOREIGN KEY (from_employee_id) REFERENCES public.employee(id) ON DELETE SET NULL;


--
-- TOC entry 5013 (class 2606 OID 50422)
-- Name: asset_movements asset_movements_from_status_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.asset_movements
    ADD CONSTRAINT asset_movements_from_status_id_foreign FOREIGN KEY (from_status_id) REFERENCES public.status(id) ON DELETE SET NULL;


--
-- TOC entry 5014 (class 2606 OID 50447)
-- Name: asset_movements asset_movements_performed_by_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.asset_movements
    ADD CONSTRAINT asset_movements_performed_by_user_id_foreign FOREIGN KEY (performed_by_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 5015 (class 2606 OID 50442)
-- Name: asset_movements asset_movements_repair_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.asset_movements
    ADD CONSTRAINT asset_movements_repair_id_foreign FOREIGN KEY (repair_id) REFERENCES public.repairs(id) ON DELETE SET NULL;


--
-- TOC entry 5016 (class 2606 OID 50437)
-- Name: asset_movements asset_movements_to_branch_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.asset_movements
    ADD CONSTRAINT asset_movements_to_branch_id_foreign FOREIGN KEY (to_branch_id) REFERENCES public.branch(id) ON DELETE SET NULL;


--
-- TOC entry 5017 (class 2606 OID 50417)
-- Name: asset_movements asset_movements_to_employee_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.asset_movements
    ADD CONSTRAINT asset_movements_to_employee_id_foreign FOREIGN KEY (to_employee_id) REFERENCES public.employee(id) ON DELETE SET NULL;


--
-- TOC entry 5018 (class 2606 OID 50427)
-- Name: asset_movements asset_movements_to_status_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.asset_movements
    ADD CONSTRAINT asset_movements_to_status_id_foreign FOREIGN KEY (to_status_id) REFERENCES public.status(id) ON DELETE SET NULL;


--
-- TOC entry 5002 (class 2606 OID 43230)
-- Name: assets assets_asset_category_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_asset_category_id_foreign FOREIGN KEY (asset_category_id) REFERENCES public.asset_category(id);


--
-- TOC entry 5003 (class 2606 OID 43245)
-- Name: assets assets_assigned_to_employee_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_assigned_to_employee_id_foreign FOREIGN KEY (assigned_to_employee_id) REFERENCES public.employee(id);


--
-- TOC entry 5004 (class 2606 OID 43240)
-- Name: assets assets_status_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_status_id_foreign FOREIGN KEY (status_id) REFERENCES public.status(id);


--
-- TOC entry 5005 (class 2606 OID 43235)
-- Name: assets assets_vendor_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_vendor_id_foreign FOREIGN KEY (vendor_id) REFERENCES public.vendors(id);


--
-- TOC entry 4999 (class 2606 OID 43171)
-- Name: employee employee_branch_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.employee
    ADD CONSTRAINT employee_branch_id_foreign FOREIGN KEY (branch_id) REFERENCES public.branch(id);


--
-- TOC entry 5000 (class 2606 OID 43176)
-- Name: employee employee_department_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.employee
    ADD CONSTRAINT employee_department_id_foreign FOREIGN KEY (department_id) REFERENCES public.section(id);


--
-- TOC entry 5001 (class 2606 OID 43181)
-- Name: employee employee_position_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.employee
    ADD CONSTRAINT employee_position_id_foreign FOREIGN KEY (position_id) REFERENCES public."position"(id);


--
-- TOC entry 5019 (class 2606 OID 50492)
-- Name: repair_remarks repair_remarks_repair_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.repair_remarks
    ADD CONSTRAINT repair_remarks_repair_id_foreign FOREIGN KEY (repair_id) REFERENCES public.repairs(id) ON DELETE CASCADE;


--
-- TOC entry 5006 (class 2606 OID 50313)
-- Name: repairs repairs_asset_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.repairs
    ADD CONSTRAINT repairs_asset_id_foreign FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;


--
-- TOC entry 5007 (class 2606 OID 50472)
-- Name: repairs repairs_delivered_by_branch_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.repairs
    ADD CONSTRAINT repairs_delivered_by_branch_id_foreign FOREIGN KEY (delivered_by_branch_id) REFERENCES public.branch(id) ON DELETE SET NULL;


--
-- TOC entry 5008 (class 2606 OID 50464)
-- Name: repairs repairs_delivered_by_employee_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.repairs
    ADD CONSTRAINT repairs_delivered_by_employee_id_foreign FOREIGN KEY (delivered_by_employee_id) REFERENCES public.employee(id) ON DELETE SET NULL;


--
-- TOC entry 5009 (class 2606 OID 50318)
-- Name: repairs repairs_vendor_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.repairs
    ADD CONSTRAINT repairs_vendor_id_foreign FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE RESTRICT;


-- Completed on 2026-01-07 09:29:51

--
-- PostgreSQL database dump complete
--

\unrestrict xtLheUcGFYaeEgX5Hh0JpDiB81HzMqhIx8Kg6ejMYFt2cR88Jk8Jm2LASurXtrY


import { GraphQLResult } from '@aws-amplify/api';
import {
  CreateTemplateMutation,
  GetTemplateQuery,
  ListTemplatesQuery,
  UpdateTemplateMutation,
} from '../API';
import { BlockTemplate } from '../utils/helpers';

interface TemplateResponseObj {
  id: string;
  template: string;
  createdAt: string;
  updatedAt: string;
  owner?: string | null | undefined;
}

const mapTemplateResp = (
  templateRespObj: TemplateResponseObj
): BlockTemplate => ({
  ...JSON.parse(templateRespObj.template),
  id: templateRespObj.id,
  createdAt: templateRespObj.createdAt,
  updatedAt: templateRespObj.updatedAt,
  owner: templateRespObj.owner,
});

export function mapListTemplatesQuery(
  listTemplatesQuery: GraphQLResult<ListTemplatesQuery>
): BlockTemplate[] {
  return (
    (listTemplatesQuery.data?.listTemplates?.items
      ?.map((template) => (template ? mapTemplateResp(template) : null))
      .filter((x) => x !== null) as BlockTemplate[]) || []
  );
}

export function mapGetTemplateQuery(
  getTemplateQuery: GraphQLResult<GetTemplateQuery>
): BlockTemplate | null {
  const getTemplateRespObj = getTemplateQuery.data?.getTemplate;
  if (getTemplateRespObj) {
    return mapTemplateResp(getTemplateRespObj);
  }
  return null;
}

export function mapCreateTemplateMutation(
  createTemplateMutation: GraphQLResult<CreateTemplateMutation>
): BlockTemplate | null {
  const createTemplateRespObj = createTemplateMutation.data?.createTemplate;
  if (createTemplateRespObj) {
    return mapTemplateResp(createTemplateRespObj);
  }
  return null;
}

export function mapUpdateTemplateMutation(
  updateTemplateMutation: GraphQLResult<UpdateTemplateMutation>
): BlockTemplate | null {
  const updateTemplateRespObj = updateTemplateMutation.data?.updateTemplate;
  if (updateTemplateRespObj) {
    return mapTemplateResp(updateTemplateRespObj);
  }
  return null;
}

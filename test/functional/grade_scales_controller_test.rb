require 'test_helper'

class GradeScalesControllerTest < ActionController::TestCase
  setup do
    @grade_scale = grade_scales(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:grade_scales)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create grade_scale" do
    assert_difference('GradeScale.count') do
      post :create, grade_scale: @grade_scale.attributes
    end

    assert_redirected_to grade_scale_path(assigns(:grade_scale))
  end

  test "should show grade_scale" do
    get :show, id: @grade_scale.to_param
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @grade_scale.to_param
    assert_response :success
  end

  test "should update grade_scale" do
    put :update, id: @grade_scale.to_param, grade_scale: @grade_scale.attributes
    assert_redirected_to grade_scale_path(assigns(:grade_scale))
  end

  test "should destroy grade_scale" do
    assert_difference('GradeScale.count', -1) do
      delete :destroy, id: @grade_scale.to_param
    end

    assert_redirected_to grade_scales_path
  end
end

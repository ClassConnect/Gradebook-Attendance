Gradebook::Application.routes.draw do
  get "courses/index"

  match 'gradebooks/:course_id/table' => 'gradebooks#table'
  match 'submit_grade' => 'assignment_grades#submit'

  resources :grade_scales
  resources :courses

  #In production, this should be changed...
  #For now, it might be too confusing
  match 'gradebooks/:course_id', :to => 'gradebooks#show'
  match 'gradebooks/:course_id/assignments', :to => "assignments#new"
  resources :assignment_grades
  resources :assignments, :except => [:index]
  match 'assignments/update/' => 'assignments#update', :via => :post
  match 'gradebooks/:course_id/assignments/update' => 'assignments#update' , :via => :post
  match 'gradebooks/:course_id/:assignment_id/edit' => 'assignments#edit'
  match 'gradebooks/:course_id/report' => 'gradebooks#report'

  match 'gradebooks/grading_scale/:course_id' => 'grade_scales#scale'
  match 'gradebooks/assignments/:id/update' => 'assignments#update_assignment_grade', :via => :put


  # The priority is based upon order of creation:
  # first created -> highest priority.

  # Sample of regular route:
  #   match 'products/:id' => 'catalog#view'
  # Keep in mind you can assign values other than :controller and :action

  # Sample of named route:
  #   match 'products/:id/purchase' => 'catalog#purchase', :as => :purchase
  # This route can be invoked with purchase_url(:id => product.id)

  # Sample resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Sample resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Sample resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Sample resource route with more complex sub-resources
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', :on => :collection
  #     end
  #   end

  # Sample resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end

  # You can have the root of your site routed with "root"
  # just remember to delete public/index.html.
  # root :to => 'welcome#index'

  # See how all your routes lay out with "rake routes"

  # This is a legacy wild controller route that's not recommended for RESTful applications.
  # Note: This route will make all actions in every controller accessible via GET requests.
  # match ':controller(/:action(/:id(.:format)))'
end
